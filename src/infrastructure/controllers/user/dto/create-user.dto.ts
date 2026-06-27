import { Type } from "class-transformer";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateIf, IsLatitude, IsLongitude, IsNumber, IsBoolean, IsArray, ArrayNotEmpty, IsDate, MinLength, Matches } from "class-validator"
import { Role } from "src/auth/role.enum";

export class CreateUserDto {

    @IsEnum(Role)
    @IsNotEmpty()
    role: Role;
    
    @IsEmail()
    @IsNotEmpty()
    email:string

    @IsString()
    // @ValidateIf((o) => o.role === 'BENEFACTOR' || o.role === 'PROFITABLE' || o.role === 'ADMIN' || o.role === 'ASSOCIATION')
    @ValidateIf(o => ['BENEFACTOR', 'PROFITABLE', 'ADMIN'].includes(o.role))      
    @IsNotEmpty({ message: 'Le mot de passe ne doit pas être vide.' })
    @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères, dont une lettre, un chiffre et un caractère spécial.' })
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&^()_\-\+]).{8,}$/, {
        message: 'Le mot de passe doit contenir au moins 8 caractères, dont une lettre, un chiffre et un caractère spécial.',
    })
    password: string;

    @IsString()
    @IsOptional()
    username:string

    @IsString({ message: 'L\’adresse fournie n’est pas valide selon les critères requis.' })
    // @ValidateIf((o) => o.role === 'BENEFACTOR' || o.role === 'BUSINESS')
    @ValidateIf(o => ['BUSINESS', 'BENEFACTOR'].includes(o.role))
    @IsNotEmpty({message: 'Veuillez renseigner le champ adresse.'})
    addresse:string

    @ValidateIf(o =>
        (o.role === 'PROFITABLE') ||
        (o.role === 'BENEFACTOR' && o.isCompany === false)
    )
    // @ValidateIf(o => ['BENEFACTOR', 'PROFITABLE'].includes(o.role))
    @IsNotEmpty()
    birthday: string;
    
    @IsString({ message: 'Le nom fournie n’est pas valide selon les critères requis.' })
    @ValidateIf(o =>
        (o.role === 'PROFITABLE') ||
        (o.role === 'BUSINESS') ||
        (o.role === 'BENEFACTOR' && o.isCompany === false)
    )
    // @ValidateIf(o => ['BENEFACTOR', 'PROFITABLE', 'BUSINESS'].includes(o.role))
    @IsNotEmpty({message: 'Veuillez renseigner le champ Nom.'})
    firstName:string
    
    @IsString()
    @ValidateIf(o =>
        (o.role === 'PROFITABLE') ||
        (o.role === 'BENEFACTOR' && o.isCompany === false)
    )
    // @ValidateIf(o => ['BENEFACTOR', 'PROFITABLE'].includes(o.role))
    @IsNotEmpty()
    lastName:string

    @IsNumber({}, { message: 'Le code postal fournie n’est pas valide selon les critères requis.' })
    // @ValidateIf((o) => o.role === 'BENEFACTOR' || o.role === 'PROFITABLE' || o.role === 'BUSINESS')
    @ValidateIf(o => ['BUSINESS', 'PROFITABLE'].includes(o.role))
    // @IsNotEmpty({message: 'Veuillez renseigner le champ code postal.'})
    @IsOptional()
    postalCode:number

    @IsNumber({}, { message: 'La ville fournie n’est pas valide selon les critères requis.' })
    // @ValidateIf((o) => o.role === 'PROFITABLE' || o.role === 'BUSINESS')
    @ValidateIf(o => ['BUSINESS', 'PROFITABLE'].includes(o.role))
    // @IsNotEmpty({message: 'Veuillez renseigner le champ ville.'})
    @IsOptional()
    cityId:number;

    @IsNumber()
    // @ValidateIf((o) => o.role === 'BUSINESS')
    @ValidateIf(o => ['BUSINESS'].includes(o.role))
    @IsOptional()
    subCategory:number;

    @IsNumber({}, { message: 'Le type fournie n’est pas valide selon les critères requis.' })
    // @ValidateIf((o) => o.role === 'BUSINESS')
    @ValidateIf(o => ['BUSINESS'].includes(o.role))
    @IsNotEmpty({message: 'Veuillez renseigner le champ type.'})
    type:number;

    @IsNumber()
    // @ValidateIf((o) => o.role === 'BENEFACTOR' || o.role === 'PROFITABLE')
    @ValidateIf(o => ['BENEFACTOR', 'PROFITABLE'].includes(o.role))
    @IsNotEmpty()
    categoriSocioPro:number

    // @IsArray()
    // @Type(() => Number)
    // @ValidateIf((o) => o.role === 'BUSINESS')
    // @ArrayNotEmpty()
    // subCategories:number[];

    @IsString({ message: 'Le numero de télephone fournie n’est pas valide selon les critères requis.' })
    // @ValidateIf((o) =>  o.role === 'BUSINESS')
    @ValidateIf(o => ['BUSINESS'].includes(o.role))
    @IsNotEmpty({message: 'Veuillez renseigner le champ numero de télephone.'})
    phone:string

    // business
    @IsString({ message: 'Le RIB fournie n’est pas valide selon les critères requis.' })
    // @ValidateIf((o) => o.role === 'BUSINESS')
    @ValidateIf(o => ['BUSINESS'].includes(o.role))
    @IsOptional({message: 'Veuillez renseigner le champ RIB.'})
    rib: string

    @IsNumber()
    // @ValidateIf((o) => o.role === 'BUSINESS')
    @ValidateIf(o => ['BUSINESS'].includes(o.role))
    @IsOptional()
    iban:number

    @IsString()
    // @ValidateIf((o) => o.role === 'BUSINESS')
    @ValidateIf(o => ['BUSINESS'].includes(o.role))
    @IsOptional()
    name:string

    @IsString()
    // @ValidateIf((o) => o.role === 'BUSINESS')
    @ValidateIf(o => ['BUSINESS'].includes(o.role))
    @IsOptional()
    description:string
    
    // @ValidateIf((o) => o.role === 'BUSINESS')
    @ValidateIf(o => ['BUSINESS'].includes(o.role))
    @IsOptional()
    @IsString()
    longitude:string

    // @ValidateIf((o) => o.role === 'BUSINESS')
    @ValidateIf(o => ['BUSINESS'].includes(o.role))
    @IsOptional()
    @IsString()
    latitude:string

    @IsString()
    // @ValidateIf((o) => o.role === 'BENEFACTOR')
    @ValidateIf(o => ['BENEFACTOR'].includes(o.role) && o.isCompany === true)
    @IsNotEmpty()
    entreprise:string

    @IsBoolean()
    @ValidateIf(o => ['BENEFACTOR'].includes(o.role))
    @IsOptional()
    isCompany:boolean

    // @IsString()
    // @ValidateIf((o) => o.role === 'BUSINESS')
    // @IsNotEmpty()
    // description:string

    // @IsString()
    // @ValidateIf((o) => o.role === 'BUSINESS')
    // @IsNotEmpty()
    // address:string
    
    @IsString({message: 'Le SIREN fournie n’est pas valide selon les critères requis.'})
    @ValidateIf(o => 
        (o.role === 'BUSINESS') || 
        (o.role === 'BENEFACTOR' && o.isCompany === true)
    )
    // @ValidateIf(o => ['BUSINESS', 'BENEFACTOR'].includes(o.role) )
    @IsNotEmpty({message: 'Veuillez renseigner le champ SIREN'})
    sirenNumber:string
    
    @IsString({message: 'La raison social fournie n’est pas valide selon les critères requis.'})
    // @ValidateIf((o) => o.role === 'BUSINESS')
    @ValidateIf(o => ['BUSINESS'].includes(o.role))
    @IsNotEmpty({message: 'Veuillez renseigner le champ raison social.'})
    socialRaison:string
    
    @IsString({message: 'La Carte d\'etudiant fournie n’est pas valide selon les critères requis.'})
    // @ValidateIf((o) => o.role === 'PROFITABLE')
    @ValidateIf(o => ['PROFITABLE'].includes(o.role))
    @IsNotEmpty({message: "Veuillez renseigner le champ Carte d'etudiant."})
    studentCard:string

    @IsBoolean()
    @IsOptional()
    isVerified: boolean

}