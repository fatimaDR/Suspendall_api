import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { PaymentPresenter } from "src/infrastructure/controllers/payment/payment.presenter";
import { Payment } from "src/infrastructure/entities/payment.entity";
import { User } from "src/infrastructure/entities/user.entity";
import { Repository } from "typeorm";
import { NotificationService } from "../notification/notification.service";
import { Product } from "src/infrastructure/entities/product.entity";
import { Business } from "src/infrastructure/entities/business.entity";
import { Stock } from "src/infrastructure/entities/stock.entity";
import { Benefactor } from "src/infrastructure/entities/benefactor.entity";
import Stripe from 'stripe';
import { SuspenduPresenter } from "src/infrastructure/controllers/stock/SuspenduPresenter";
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as pdf from 'html-pdf-node';
import * as path from 'path' ;
import { format } from 'date-fns';
import { MailService } from "src/mail/mail.service";
import * as paypal from '@paypal/checkout-server-sdk';
import { OrderItemsService } from "../orderItems/order-items.service";
import { OrderService } from "../order/order.service";
import { exec } from "child_process";
import { OrderPresenter } from "src/infrastructure/controllers/oder/order.presenter";
import { Order } from "src/infrastructure/entities/order.entity";
import { OrderItem } from "src/infrastructure/entities/order-item.entity";
import { StockService } from "../stock/stock.service";
import { NOTIFICATIONTYPE } from "src/functions/notification.enum";

@Injectable()
export class PaymentService {
    private environment: paypal.core.SandboxEnvironment | paypal.core.LiveEnvironment;
    private client: paypal.core.PayPalHttpClient;

    constructor(
        @Inject('PAIMENT_REPOSITORY')
        private readonly paymentRepository: Repository<Payment>,

        @Inject('USER_REPOSITORY') 
        private userRepository: Repository<User>,

        @Inject('PRODUCT_REPOSITORY') 
        private productRepository: Repository<Product>,

        @Inject('BUSINESS_REPOSITORY')
        private businessRepository: Repository<Business>,

        @Inject('STOCK_REPOSITORY')
        private stockRepository: Repository<Stock>,

        @Inject('BENEFACTOR_REPOSITORY')
        private benefactorRepository: Repository<Benefactor>,

        @Inject('ORDER_REPOSITORY')
        private readonly orderRepository: Repository<Order>,

        @Inject('ORDER_ITEM_REPOSITORY')
        private readonly orderItemRepository: Repository<OrderItem>,

        private notificationService: NotificationService,
        private mailService: MailService,

        private orderItemsService: OrderItemsService,
        private orderService: OrderService,
        private stockService: StockService,
    ){
        this.environment = new paypal.core.SandboxEnvironment(
            process.env.PAYPAL_CLIENT_ID,
            process.env.PAYPAL_CLIENT_SECRET,
        );
        this.client = new paypal.core.PayPalHttpClient(this.environment);
    }

    // async processCart(cart, user) {
    //     const business = await this.businessRepository.findOneBy({ id: cart.businessId });
    //     const benefactor = await this.benefactorRepository.findOneBy({id: user.benefactor.id});
    //     const items = cart.items;
    //     let totalAmount = 0;
    //     let productsSuspendu = 0;
    //     let orderDetails = [];
    
    //     for (let item of items) {
    //         const product = await this.productRepository.findOne({
    //             where: { id: item.productId },
    //             relations: ['tags']
    //         });
    
    //         const subTotal = product.price * item.quantity;
    //         totalAmount += subTotal;
    //         productsSuspendu += item.quantity;
    
    //         const data = {
    //             quantity: item.quantity,
    //             productPrice: product.price,
    //             product: product,
    //             business: business,
    //             benefactor: benefactor, // Ensure this variable is defined somewhere in your scope
    //             total: subTotal
    //         };
    
    //         const createSuspendu = this.stockRepository.create(data);
    //         const order = await this.stockRepository.save(createSuspendu);
    
    //         orderDetails.push(order);
    //     }
    
    //     return {
    //         orderDetails,
    //         totalAmount
    //     }
    // }
    
    async createOrder(userId: number, carts){
        try {

            const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
            let order, orderPaid ;
            let paypalUrl;
            let orders = [];
            let errors = [];
            let subTotal = 0;
            let productsSuspendu = 0
            let messageNotif
            let data
            let bankFee = parseFloat(process.env.BANK_FEE)
            let bankCharges = 0
            let customer, clientSecret, orderStatus
        
            const user = await this.userRepository.findOne({
                where: {id: userId},
                relations: ['userSetting', 'benefactor']
            })
            const benefactor = await this.benefactorRepository.findOneBy({id: user.benefactor.id});
            for(let cart of carts['carts']){
                
                order = await this.orderItemsService.create(cart, user)
                orders.push(order)
            }
            
            let amount = orders.reduce((acc, order) => acc + order.totalAmount, 0);
            subTotal += amount 
            let paiment = {
                total: 0,
                subTotal: 0,
                stripeId: '',
                paymentMode: "",
                tva: 0,
                bankFee: 0,
                lbs: 0,
                order: null
            }

            if (carts.lbs) {
                // Add donation in lbs to the order
                amount += carts.lbs;
                paiment.lbs = carts.lbs
                messageNotif = `Merci pour votre contibution de ${carts.lbs}€ a Suspendall` 
                // send notification to profittable to thank him for Receipt of payment for suspendall
                if (user.userSetting && user.userSetting.isNotifActive) {
                    await this.notificationService.sendNotifMessage(user.id, user.id, user, NOTIFICATIONTYPE.Transaction, "Reception de paiement", messageNotif)
                }
            }

            const orderData = {
                subTotal: subTotal, 
                total: amount,
                status: "",
                benefactor: benefactor
            }

            order = await this.orderService.create(orderData)
            let flag = 0
            let businessWithUser
            if (carts.paymentMethod === 'paypal') {
                flag++
                bankCharges = (order.total * 1.40 / 100) + bankFee;
                const request = new paypal.orders.OrdersCreateRequest();
                request.prefer('return=representation');
                const siteUrl = process.env.SITE_URL;
                request.requestBody({
                intent: 'CAPTURE',
                application_context: {
                    return_url: `${siteUrl}/api/payment/paypal-success`,
                    cancel_url: `${siteUrl}/api/payment/paypal-cancel`,
                    // user_action: 'PAY_NOW' 
                },
                purchase_units: [
                    {
                    amount: {
                        currency_code: 'eur',
                        value: order.total,
                    },
                    },
                ],
                });
                // console.log(request)
                try {
                    orderPaid = await this.client.execute(request);
                    paiment.paymentMode = 'paypal';
                    order.status = 'pending';
                    const orderCreated = await this.orderRepository.save(order);

                    paiment.total = orderCreated.total;
                    paiment.subTotal = orderCreated.subTotal;
                    paiment.order = orderCreated;
                    paiment.stripeId = orderPaid.result.id;
                    paiment.bankFee = bankCharges;
                    await this.paymentRepository.save(paiment);
                    paypalUrl = orderPaid.result.links.find(link => link.rel === 'approve')?.href;
                } catch (error) {
                    console.error('[PayPal Create Error]', error);
                    throw new HttpException('Une erreur est survenue lors de la création de la commande.', HttpStatus.BAD_REQUEST);
                }
            }
            
            if(carts.paymentMethod === 'card') {

                bankCharges = (order.total * 1.5 / 100) + bankFee;
                paiment.bankFee = bankCharges;
                if (!user.stripeId) {
                    console.log("client n'existe pas")
                    // Create payment method
                    const paymentMethod = await stripe.paymentMethods.create({
                        type: 'card',
                        card: {
                            token: 'tok_visa', 
                        },
                    });
                    // console.log(paymentMethod)
                    // Create customer from benefactor connected
                    customer = await stripe.customers.create({
                        payment_method: paymentMethod.id,
                        address: {
                            // "adress": user.addresse,
                            "postal_code": user.postalCode,
                        },
                        invoice_settings: {
                            default_payment_method: paymentMethod.id, 
                        },
                        email: user.email,
                        name: user.firstName +' '+ user.lastName,
                        phone: user.phone
                    }); 
                    user.stripeId = customer.id;
                    await this.userRepository.save(user);
                    // Attach payment method created to a customer
                    const pm = await stripe.paymentMethods.attach(
                        paymentMethod.id,
                        {customer: customer.id}
                    );
                    // PAIMENT BY STRIPE
                    orderPaid = await stripe.paymentIntents.create({
                        amount:(order.total + bankCharges) * 100,
                        currency: 'eur',
                        payment_method: paymentMethod.id,
                        payment_method_types: ['card'], 
                        customer: customer.id,
                        description: 'Payment for Order ',
                    });
                    // Confirm the PaymentIntent to complete the payment
                    // clientSecret = await stripe.paymentIntents.confirm(orderPaid.id);
                    clientSecret = orderPaid.client_secret

                }else{
                    console.log("client existe déjà")
                    customer = await stripe.customers.retrieve(user.stripeId);
                    // Ensure the customer has a default payment method
                    if (!customer.invoice_settings.default_payment_method) {
                        errors.push({
                            field: 'payment',
                            message: 'Aucune méthode de paiement par défaut n’est configurée pour ce client.'
                        });

                        errors.push({
                            field: 'payment',
                            message: 'Cannot create '
                            
                        });
                                    
                        throw new HttpException(
                            {
                                message: "",
                                errors: errors
                            },
                            HttpStatus.BAD_REQUEST,
                        );
                    }
                    // PAIMENT BY STRIPE
                    const paymentMethod = await stripe.paymentMethods.retrieve(
                        customer.invoice_settings.default_payment_method
                    );
                    orderPaid = await stripe.paymentIntents.create({
                        amount: (order.total + bankFee) * 100,
                        currency: 'eur',
                        payment_method: paymentMethod.id,
                        payment_method_types: ['card'], 
                        customer: customer.id,
                        description: 'Payment for Order ',
                    });
                    // Confirm the PaymentIntent to complete the payment
                    // orderStatus = await stripe.paymentIntents.confirm(orderPaid.id);
                    clientSecret = orderPaid.client_secret
                    // console.log(orderPaid.client_secret)
                }
    
                paiment.stripeId = orderPaid.id
                paiment.paymentMode = 'card'
            }
            // if(orderPaid) order.status = 'paid'
            if ((orderPaid && carts.paymentMethod === 'card' && clientSecret) || (orderPaid && carts.paymentMethod === 'paypal')){
                
                order.status = 'paid'
                const orderCreated = await this.orderRepository.save(order);
                if(orderCreated) {
                    paiment.total = orderCreated.total
                    paiment.subTotal = orderCreated.subTotal
                    paiment.order = orderCreated
                }
                for(let ord of orders){
                    let business = ord.business
                    if (!business.user) {
                        businessWithUser = await this.businessRepository.findOne({
                        where: { id: business.id },
                        relations: ['user']
                        });
                    }
                    let busProducts = []
                    const orderDate = new Date().toLocaleDateString('fr-FR');
                    for(let cmdLine of ord.orderDetails){
                        // ord.order = orderCreated
                        const product = await this.productRepository.findOne({
                            where: { id: cmdLine.product.id },
                            relations: ['tags']
                        });
                        if (product.quantity < cmdLine.quantity) {
                            throw new HttpException(
                                `Le produit ${product.title} n'a pas suffisamment de stock.`,
                                HttpStatus.BAD_REQUEST
                            );
                        }
                        // Réduire la quantité en stock
                        product.quantity -= cmdLine.quantity;
                        await this.productRepository.save(product);
                        const commandLine = {
                            productPrice: cmdLine.productPrice,
                            quantity: cmdLine.quantity,
                            product: product,
                            total: cmdLine.total,
                            order: orderCreated,
                            business: business
                        }
                        
                        await this.orderItemRepository.save(commandLine);
                        productsSuspendu += cmdLine.quantity;

                        // ajout les produits d'un commerce
                        for (let i = 0; i < cmdLine.quantity; i++) {
                            busProducts.push(product);
                        }  
                    }
                    
                    if(busProducts.length > 0){
                        const messageBusiness = `Bonne nouvelle ! Un bienfaiteur a suspendu ${busProducts.length} produit${busProducts.length > 1 ? 's' : ''} le ${orderDate}.`;
                        await this.notificationService.sendNotifMessage(businessWithUser.user.id, businessWithUser.user.id, businessWithUser.user, NOTIFICATIONTYPE.Transaction, "Produit suspendu", messageBusiness)
                    }  
                }
                const paymentCreated = await this.paymentRepository.create(paiment)
                paymentCreated.order = orderCreated
                const paidCmd = await this.paymentRepository.save(paymentCreated)
                if (paidCmd) {
                    // add products to stock table
                    const getOrderCreated = await this.orderRepository.findOne({
                        where: {id: paidCmd.order.id},
                        relations: ['orderItems.business']
                    })
                    const createSuspendus  = await this.stockService.create(user, getOrderCreated.orderItems)
                    for(let suspendu of createSuspendus){
                        suspendu.order = getOrderCreated
                        await this.stockRepository.save(suspendu)
                    }
                }
            
                // Generate user pdf
                const result = orderCreated.total + bankCharges
                if (carts.fiscal_receipt === true) {
                    console.log("pdf")
                    const currentDate = format(new Date(), 'dd-MM-yyyy');
                    const baseUrl = process.env.SITE_URL;
                    const dataType = {
                        num: orderCreated.id,
                        url: baseUrl,
                        firstName: user.firstName  ? user.firstName+' '+user.lastName : user.benefactor.entreprise,
                        date: currentDate,
                        address: user.addresse,
                        postal: user.postalCode,
                        total: result
                    }
                    // const mail_template = "pdf";
                    const pdfPath = await this.generatePdf(dataType)
                    const relativePath = pdfPath.split('public')[1];
                    const normalizedPath = relativePath.replace(/\\/g, '/');
                    const pdfUrl = `${baseUrl}${normalizedPath}`;
                    const context = {
                        firstName: user.firstName  ? user.firstName : user.benefactor.entreprise,
                        lastName: user.lastName ? user.lastName : '', 
                        url: baseUrl,
                        appName: 'Suspendall',
                        pdfUrl: pdfUrl
                    };
                    // Send an email to donor
                    const mail_subject = "Reçu de donnation";
                    const mail = this.mailService.send_file_attachment(user.email, mail_subject, context, pdfPath);
                }
                if (user.userSetting ) {
                    // si push notification est activé pour cet user
                    messageNotif = "Le document généré pour votre commande est disponible."
                    await this.notificationService.sendNotifMessage(user.id, user.id, user, NOTIFICATIONTYPE.Transaction, "Rapport de commande",  messageNotif)
                }
            
                // send notification to benefactor to confirm don suspendall
                messageNotif = `Votre don de ${productsSuspendu} produits a été traité avec succès`; 
                await this.notificationService.sendNotifMessage(user.id, user.id, user, NOTIFICATIONTYPE.Transaction, "Confirmation de don", messageNotif)
            
                if (flag == 1) {
                    // const paypalUrl = orderPaid.result.links[1].href
                    data = {
                        message: 'Votre paiement a été effectué avec succès.',
                        paypalUrl: paypalUrl
                    }
                }else{
                    data = {
                        message: 'Votre paiement a été effectué avec succès.',
                        //order: new  OrderPresenter(orderCreated),
                        // stock: productsSuspendu,
                        clientSecret: clientSecret
                    }
                }
                console.log(paiment.bankFee)
                return { data }
            }  
            throw new HttpException(
                {
                  message: "Le client n'a pas finalisé le paiement."
                },
                HttpStatus.BAD_REQUEST
            );   
            
        } catch (error) {
            if(error.response) throw new HttpException(error.response, error.status)
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
        
    }

    
    // capture le paiement et marque la commande comme paid
    async capturePaypalOrder(token: string) {
        try {
            const request = new paypal.orders.OrdersCaptureRequest(token);
            request.requestBody({});
            const capture = await this.client.execute(request);
            const paypalOrderId = capture.result.id;
            const status = capture.result.status;

            if (status !== 'COMPLETED') {
                throw new HttpException("Le paiement PayPal n'a pas été complété", HttpStatus.BAD_REQUEST);
            }

            // Trouver le paiement par ID PayPal
            const payment = await this.paymentRepository.findOne({
                where: { stripeId: paypalOrderId, paymentMode: 'paypal' },
                relations: ['order']
            });

            if (!payment || !payment.order) {
                throw new HttpException('Aucune commande correspondante n’a été trouvée pour ce paiement.', HttpStatus.NOT_FOUND);
            }

            // Mettre à jour le statut
            payment.order.status = 'paid';
            await this.orderRepository.save(payment.order);
            await this.paymentRepository.save(payment);
            return {
                message: 'Le paiement PayPal a été capturé avec succès.',
                orderId: payment.order.id,
                status: payment.order.status,
            };
        } catch (error) {
            console.error('[PayPal Capture Error]', error.response || error);
            // console.error('[PayPal Capture Error]', error);
            throw new HttpException('Une erreur est survenue lors de la capture du paiement PayPal.', HttpStatus.BAD_REQUEST);
        }
    }


    async findOrders(userId: number, businessId: number) {
        try {
            let orders = []
            let total = 0
            const user = await this.userRepository.findOneBy({id: userId})
            
            if (user) {
                orders = await this.stockRepository.createQueryBuilder('order')
                .leftJoinAndSelect('order.product', 'product')
                .leftJoinAndSelect('order.benefactor', 'benefactor')
                .leftJoinAndSelect('order.business', 'business')
                .where('benefactor.id = :benefactorId', { benefactorId: user.benefactor.id })
                .andWhere('order.business.id = :businessId', {businessId: businessId})
                .getMany();
                for(let totalPrice of orders.map((order) => order.total)){
                    total += totalPrice
                }
                return {
                data: { 
                        orders: orders.map((order) => new SuspenduPresenter(order)),
                        total: total
                    }
                }
            }
            throw new HttpException(
                {
                errors: {
                    message: 'L’identifiant de l’utilisateur n’existe pas.'
                }
                },
                HttpStatus.NOT_FOUND,
            );  
            
        } catch (error) {
            if(error.response) throw new HttpException(error.response, error.status)
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    // Generate the pdf for donation
    async generatePdf(data: any) {
        // Read the HBS template file
        const templateHtml = fs.readFileSync('views/suspendall/donations.hbs', 'utf8');
        // Define the directory path
        const directoryPath = './public/pdfs/suspendall/donations';
        // Create the directories if they don't exist
        fs.mkdirSync(directoryPath, { recursive: true });
        data = { 
            pdf: {
                logo:'LOGO', 
                url: `${data.url}`,
                num: data.num,
                adress1: `${data.address}`,
                adress2: `${data.postal}`, 
                title: "ATTESTATION DE RECU DE DON",
                receive: "Reçu",
                association: "Je soussigné BOURKIA Brahim, président de l'association",
                suspendall: "SUSPENDALL",
                susp_adress: "Siège Social : l'Agora, 254 Bd du Maréchal Juin,",
                susp_adress2: "78200 Mantes-la-Jolie",
                association_rules: "Association régie par la loi du 1er juillet 1901 et le décret du 16 août 1901,RNA : W781009994",
                name: "Certifie avoir reçu de ",
                full_name: `${data.firstName}` ,
                total: `La somme de ${data.total} € euros par virement bancaire sur la période de ${data.date} dans le but d'aider à financer des opérations en faveur des personnes en situation précaire.`,
                city: `A MANTES LA JOLIE ${data.date}`,
                president: "Le président",
                certificate: "Conserver cette attestation"
            }
            
        }
        // Compile the HBS template
        const template = handlebars.compile(templateHtml);
        const html = template(data);

        // Generate PDF
        const options: pdf.CreateOptions = {
            format: 'A4',
        };
        const pdfBuffer = await pdf.generatePdf({ content: html }, options);
        // Generate the PDF file path
        // const pdfPath = path.join(directoryPath, `${line.product.grossiste.id}-${data.commande.num}.pdf`);
        const pdfPath = path.join(directoryPath, `${data.pdf.num}-${data.pdf.full_name}.pdf`);
        await fs.writeFileSync(pdfPath, pdfBuffer);

        return pdfPath
    }
}
