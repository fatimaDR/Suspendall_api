import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { ResetPasswordProviders } from 'src/infrastructure/providers/ResetPassword.providers';

@Module({
    controllers: [],
    providers: [...ResetPasswordProviders],
    imports: [DatabaseModule],
    exports: [...ResetPasswordProviders]
})
export class ResetPasswordModule {}
