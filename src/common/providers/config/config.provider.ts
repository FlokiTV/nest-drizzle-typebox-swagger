import { Injectable } from '@nestjs/common';

// default values
const JWT_SECRET = 'supersecret123';

@Injectable()
export class Config {
  jwt() {
    return process.env.JWT_SECRET || JWT_SECRET;
  }
}
