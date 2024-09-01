import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getWelcome(): string {
    return 'Hello welcome to vascon vending machine api!';
  }
}
