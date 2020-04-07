import { Injectable } from '@angular/core';
import { SHA3 } from 'sha3';

@Injectable({
  providedIn: 'root'
})
export class HashService {
  hash = new SHA3(512);
  constructor() { }

  hashPassword(plainPassword: string) {
    this.hash.update(plainPassword);
    let password = this.hash.digest('hex');
    this.hash.reset();
    return password;
  }
}
