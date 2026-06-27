// import * as bcrypt from 'bcrypt';
// import * as crypto from 'crypto';
// export async function hashPassword(password) {
//     const salt = await bcrypt.genSalt();
//     password = await bcrypt.hash(password, salt);
//   return password;
// }

var generator = require('generate-password');

export function validatePassword(password: string): boolean {
  // Minimum length check
  if (password.length < 8) {
      return false;
  }

  // Regular expressions for checking character types
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);

  // Check if all criteria are met
  if (hasLetter && hasNumber && hasSpecialChar) {
      return true;
  }
  return false;
}
export function generatePassword(length: number): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';

  // Ensure at least one letter
  password += charset.charAt(Math.floor(Math.random() * 52));
  
  // Ensure at least one number
  password += charset.charAt(52 + Math.floor(Math.random() * 10));
  
  // ensure at least one special char
  password += charset.charAt(62 + Math.floor(Math.random() * 8));

  for (let i = 3; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset.charAt(randomIndex);
  }

  // Shuffle the characters to make the password more random
  password = password.split('').sort(() => 0.5 - Math.random()).join('');

  // use the generator plugin
  // const password = generator.generate({
  //   length: length,
  //   numbers: true,
  //   symbols: true
  // });

  return password;
}

export function convertStringToTime(timeString) {
  // Split the timeString into hours and minutes
  const [hours, minutes] = timeString.split(':').map(Number);

  // Create a new Date object and set the time components
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0); // Optionally set seconds to zero

  return date.getTime();
}


export function getBusinessDistance(query, business)  {
  
  let distance = 0;  

  if (business) {
      const radians = degrees => (degrees * Math.PI) / 180;
      distance = 6371 * Math.acos(
          Math.cos(radians(query.lat)) * Math.cos(radians(business.latitude)) * Math.cos(radians(query.lng) - radians(business.longitude)) +
          Math.sin(radians(query.lat)) * Math.sin(radians(business.latitude))
      );
  }
  return parseFloat(distance.toFixed(2));
}

  export function generateBusinessQRCode(socialRaison: string, sirenNumber: string, businessId: number, userId: number) {
    
    const now = Date.now(); 
    const data = `${socialRaison}-${sirenNumber}-${businessId}-${userId}-${now}`;

    try {
      const qrCodeDataUrl = Buffer.from(data).toString('base64');
      
      return qrCodeDataUrl;
    } catch (error) {
      throw new Error('Erreur lors de la génération du QR Code');
    }
  }
