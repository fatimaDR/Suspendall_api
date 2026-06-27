import { Controller, Get, Post, Patch, Param, Delete, UseGuards, Query, UploadedFile, UseInterceptors, Request, ParseFilePipeBuilder, Put, Body, Res, Req } from '@nestjs/common';
import { BusinessService } from '../../services/business/business.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from 'src/auth/role.enum';
import { Roles } from 'src/auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { User } from 'src/auth/user.decorator';
import { CreateProductDto } from '../product/dto/create-product.dto';
import { MediaType } from 'src/infrastructure/entities/media.entity';
import { ReservationService } from 'src/infrastructure/services/reservation/reservation.service';
import { ProductLimitRequestService } from 'src/infrastructure/services/productLimitRequest/product-limit-request.service';
import { CreateProductLimitRequestDto } from '../productLimitRequest/dto/create-product-limit-request.dto';
import { Response } from 'express';

@Controller('business')
export class BusinessController {
    constructor(private readonly businessService: BusinessService, 
        private reservationService: ReservationService,
        private readonly productLimitRequestService: ProductLimitRequestService
    ) {}

    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(Role.Benefactor, Role.Profitable)
    // @Get()
    // findBusinessesAroundMe(@Query() query) {
        
    //     return this.businessService.findBusinessesAroundMe(query);
    // }

    @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(Role.Benefactor, Role.Profitable, Role.Admin)
    @Get('search')
    async findAll(
      @Query() query,
      @User() user
    ) {
      return await this.businessService.findAll(query, user.id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Benefactor, Role.Profitable)
    @Get(':id')
    async businesDetails(
        @Param('id') id: string,
        @Query() query,
        @User() user
        ){
        return await this.businessService.businessDetails(+id, query, user.id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.businessService.remove(+id);
    }

    // l'admin valide le compte du commerce (commerce à deja envoyer une demande de création de compte)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Patch('validate-account/:id')
    validateAccount(@Param('id') id: string){
        return this.businessService.validateAccount(+id)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Business)
    @Put('media')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/business',
            }),
        }),
    )
    async addMedia(
        @User() user,
        @Body() body: {type: MediaType},
        @UploadedFile(
        new ParseFilePipeBuilder()
            .addFileTypeValidator({
                fileType: /(jpg|jpeg|png)$/,
            })
            .build({
                fileIsRequired: false,
            }),
        )
        file?: Express.Multer.File,
    ) {
        const {type} = body
        
        if (file) {
            file.path = path.normalize(file.path).replace(/\\/g, '/'); 
        }
        console.log(file.path)
        return await this.businessService.addMedia(user.id, type, file)
    }

  
    
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(Role.Profitable)
    @Get('suspendu/:id')
    async listSuspendus(
        @Param('id') id: string
        ){
        return await this.businessService.listSuspendu(+id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Business)
    @Post('add-product')
    async addProducts(@Body() createProductDto: CreateProductDto, @User() user){
        
        return await this.businessService.addProducts(createProductDto, user.id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Patch('active-desactive/:id')
    async businessActiveted(@Param('id') id: string){
        return await this.businessService.businessActiveted(+id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Business)
    @Get('revenue/price')
    async calculatePricePerWeekAndMonth(@User() user){
        return await this.businessService.calculatePricePerWeekAndMonth(user.business.id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Business)
    @Get('stock/statistics')
    async availableStock(@User() user){
        return await this.businessService.getStockStatistics(user.business.id);
    }

    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(Role.Business)
    // @Put('reservedStock')
    // async reservedStock(@User() user){
    //     return await this.businessService.getReservedStock(user.business.id);
    // }

    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(Role.Business)
    // @Put('recoveredStock')
    // async recoveredStock(@User() user){
    //     return await this.businessService.recoveredStock(user.business.id);
    // }

    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(Role.Business)
    // @Put('averageTime')
    // async averageRecoveryTime(@User() user){
    //     return await this.businessService.averageRecoveryTime(user.business.id);
    // }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Business)
    @Post('giveADonation')
    async giveADonation(
        @Body() createSuspend, 
        @User() user
    ){
        return await this.businessService.giveADonation(user.business.id, createSuspend);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Profitable, Role.Benefactor, Role.Admin, Role.Business)
    @Get('feedbacks/:id')
    async getComments(@Param('id') id: string, @User() user) {
        return await this.businessService.getComments(+id, user.id);
    }

    
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Profitable, Role.Benefactor, Role.Admin, Role.Business)
    @Get('feedbacks/:id/check')
    async checkFeedback(@Param('id') id: string, @User() user) {
        return await this.businessService.checkFeedback(+id, user.id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Benefactor)
    @Get('products/:id')
    async listProducts(
        @Param('id') id: string,
        @Query('offset') offset: number,
        @Query('limit') limit: number
    ){
        return await this.businessService.listProducts(+id, offset, limit);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Business)
    @Get('list/products')
    async productsOfBusiness(
        @User() user,
        @Query('type') type: string
    ){
        console.log("rrr")
        return await this.businessService.productsOfBusiness(user.id, type);
    }

    @Get('recommended/:businessId')
    async recommandedForYou(
        @Param('businessId') businessId: number,
        @Query('limit') limit: string,
    ) {
        const parsedLimit = limit ? parseInt(limit, 10) : 10; 
        return await this.reservationService.recommandedForYou(businessId, parsedLimit);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Business)
    @Get('list/orders')
    async ordersOfBusiness(
        @User() user,
        @Query() query,
    ) {
      return await this.businessService.ordersOfBusiness(user.id, query);
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Business)
    @Post('product-limit')
    async create(@Body() createProductLimitRequestDto: CreateProductLimitRequestDto, @User() user) {
        return await this.productLimitRequestService.requestProductLimit(user.id, createProductLimitRequestDto);
    }


    @Get()
    async getBusinessByQrCode(
        @Query('qrcode') qrcode: string,
        @Res({ passthrough: true }) res: Response
    ) {
        const html = await this.businessService.getBusinessByQrCode(qrcode);
        res.setHeader('Content-Type', 'text/html');
        return html;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Business)
    @Post('qrcode/refresh')
    async refreshQr(@Req() req: Request) {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error('Token manquant ou invalide');
        }
        const token = authHeader.replace('Bearer ', '').trim();
        return await this.businessService.refreshQrFromToken(token);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Benefactor, Role.Profitable)
    @Get('qrcode/:qrcode')
    async businessByQRCode(
        @Param('qrcode') qrcode: string, @User() user,
        ){
        console.log('qrcode')
        return await this.businessService.businessByQRCode(user.id, qrcode);
    }
    
}
