import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Address } from './address.entity';

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
}
