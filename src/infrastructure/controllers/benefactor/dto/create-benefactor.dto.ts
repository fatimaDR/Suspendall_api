import { IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateIf } from "class-validator";

export class CreateBenefactorDto{

    @IsBoolean()
    @IsOptional()
    isCompany:boolean

    @ValidateIf((o) => o.isCompany === true)
    @IsString()
    @IsOptional()
    sirenNumber:string

    @ValidateIf((o) => o.isCompany === true)
    @IsString()
    @IsNotEmpty()
    entreprise:string


}
