import { Controller, Get, Put, Body, Res } from '@nestjs/common';
import { SettingsService } from '../../services/settings/settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { Role } from 'src/auth/role.enum';
import { Roles } from 'src/auth/roles.decorator';

@Controller('settings')
@Roles(Role.Admin)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Put()
  update(
    @Body() updateSettingDto: UpdateSettingDto,
    @Res({ passthrough: true }) res: any
  ) {
    return this.settingsService.updateSettings(updateSettingDto, res);
  }

  @Get()
  find() {
    return this.settingsService.findSettings();
  }
  
}
