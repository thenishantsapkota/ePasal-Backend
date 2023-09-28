import { Users } from 'src/users/entities';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  street: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  postal_code: string;

  @ManyToOne(() => Users, (user) => user.billingAddresses)
  billingUser: Users;

  @ManyToOne(() => Users, (user) => user.shippingAddresses)
  shippingUser: Users;
}
