import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UpdateSettingDto } from '../../controllers/settings/dto/update-setting.dto';
import { Repository } from 'typeorm';
import { Settings } from 'src/infrastructure/entities/settings.entity';
import { SettingsPresenter } from 'src/infrastructure/controllers/settings/settings.presenter';

@Injectable()
export class SettingsService {

  constructor(
    @Inject('SETTINGS_REPOSITORY')
    private readonly settingsRepository: Repository<Settings>
  ){}

  async updateSettings(updateSettingDto: UpdateSettingDto, res) {
    try{
      const settings = await this.settingsRepository.createQueryBuilder("settings")
        .orderBy("settings.id")
        .getOne()
      if(settings){
        await this.settingsRepository.update(settings.id, updateSettingDto)
      }else{
        const created = await this.settingsRepository.create(updateSettingDto)
        await this.settingsRepository.save(created)
      }
      const edited_settings = await this.settingsRepository.createQueryBuilder("settings")
        .orderBy("settings.id")
        .getOne()

      res.status(HttpStatus.OK)
      return {
        data: { settings: new SettingsPresenter(edited_settings) },
        message: 'edited'
      }

    }catch(error){
      if(error.response) throw new HttpException(error.response, error.status)
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async findSettings() {
    try{
      const settings = await this.settingsRepository.createQueryBuilder("settings")
        .orderBy("settings.id")
        .getOne()
      
      if(settings){
        return {
          data: { settings: new SettingsPresenter(settings) }
        }
      }else{
        throw new HttpException(
          {
            errors: {
              message: 'Aucun paramètre trouvé.'
            }
          },
          HttpStatus.NOT_FOUND,
        );
        // throw new HttpException('Aucun paramètre trouvé.', HttpStatus.NOT_FOUND)
      }
    }catch(error){
      if(error.response) throw new HttpException(error.response, error.status)
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async getReservationValidationTime(): Promise<number> {
    const settingsData = await this.findSettings();
    const settings = settingsData.data.settings;
    return settings.reservationValidationTime ?? 1440; // fallback 24h
  }

}
