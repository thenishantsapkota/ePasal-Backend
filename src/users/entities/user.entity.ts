import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Address } from '../../addresses/entities';
import { Otp } from './otp.entity';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false, select: false })
  password: string;

  @Column({ default: false })
  verified: boolean;

  @Column({ default: false })
  is_admin: boolean;

  @Column({ default: 'user', enum: ['user', 'seller', 'admin'] })
  role: string;

  @Column({ nullable: true })
  first_name?: string;

  @Column({ nullable: true })
  last_name?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  profile_picture?: string;

  @OneToMany(() => Address, (address) => address.billingUser)
  billingAddresses: Address[];

  @OneToMany(() => Address, (address) => address.shippingUser)
  shippingAddresses: Address[];

  @OneToOne(() => Otp, (otp) => otp.user, { nullable: true })
  otp?: Otp;
}
