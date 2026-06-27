import { Body, Controller, Get, HttpException, HttpStatus, Param, Patch, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { Role } from "src/auth/role.enum";
import { Roles } from "src/auth/roles.decorator";
import { RolesGuard } from "src/auth/roles.guard";
import { User } from "src/auth/user.decorator";
import { PaymentService } from "src/infrastructure/services/payment/payment.service";
import { Response } from 'express';


@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.Benefactor)
  // @Post()
  // async create(
  //   @Body() body,
  //   @User() user) {
  //   return await this.paymentService.create(body, user.id);
  // }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Benefactor)
  @Post()
  async create(
    @Body() body,
    @User() user) {
    return await this.paymentService.createOrder(user.id, body);
  }

  @Get('paypal-success')
  async handlePaypalSuccess(
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    if (!token) {
      throw new HttpException('Aucun jeton fourni.', HttpStatus.BAD_REQUEST);
    }

    try {
      const capture = await this.paymentService.capturePaypalOrder(token);
      // redirige vers une page ou retourne un message de succès
      return res.json({ message: 'Votre paiement a été effectué avec succès.', capture });
    } catch (error) {
      throw new HttpException('Une erreur est survenue lors de la capture du paiement PayPal.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.Benefactor)
  // @Patch('paypal/capture')
  // async capturePaypal(@Query('token') token: string) {
  //   return this.paymentService.capturePaypalOrder(token);
  // }
  

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Benefactor)
  @Get(':id')
  async findAll(
    @Param('id') id: string,
    @User() user
    ) {
    return await this.paymentService.findOrders(user.id, +id);
  }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.Benefactor)
  // @Get('pdf')
  // async generatePdf(@Req() req) {
  //   const baseUrl = `${req.protocol}://${req.get('host')}`;
  //   const data = {
  //     commande: {
  //       num: 'jzgfjhfjh'
  //     },
  //     url: baseUrl
  //   }
  //   const pdfPath = await this.paymentService.generatePdf(data);
  //   return pdfPath
  // }

}