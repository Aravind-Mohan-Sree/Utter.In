import { Booking } from '~entities/Booking';
import { IBaseRepository } from './IBaseRepository';
import { IBooking } from '~models/BookingModel';

export interface IBookingRepository extends IBaseRepository<Booking, IBooking> { }
