import TicketTypeRequest from "./lib/TicketTypeRequest.js";
import InvalidPurchaseException from "./lib/InvalidPurchaseException.js";
import TicketPaymentService from "../thirdparty/paymentgateway/TicketPaymentService.js";
import SeatReservationService from "../thirdparty/seatbooking/SeatReservationService.js";

export default class TicketService {
  static MAX_TICKETS = 20;

  async purchaseTickets(accountId, ...ticketTypeRequests) {
    let totalAmount = 0;
    let totalSeats = 0;

    //validate accountId
    this._validateId(accountId);

    // Validate each ticketTypeRequest and calculate total amount and total seats
    for (const ticketTypeRequest of ticketTypeRequests) {
      this._validateRequest(ticketTypeRequest);
      const { amount, seats } = this._calculatePaymentAndSeats(ticketTypeRequest);
      totalAmount += amount;
      totalSeats += seats;
    }

    // Make a payment request
    const payForTicket = new TicketPaymentService();
    payForTicket.makePayment(accountId, totalAmount);

    // Make a seat reservation request
    const reserveSeat = new SeatReservationService();
    reserveSeat.reserveSeat(accountId, totalSeats);

    return { totalAmount, totalSeats };
  }

  _validateRequest(ticketTypeRequest) {
    const numInfantTickets = ticketTypeRequest.infant;
    const numChildTickets = ticketTypeRequest.child;
    const numAdultTickets = ticketTypeRequest.adult;
    const totalTickets = numInfantTickets + numChildTickets + numAdultTickets;

    if(totalTickets > TicketService.MAX_TICKETS){
      throw new InvalidPurchaseException("Total number of tickets exceeds the maximum limit of 20 tickets");
    }

    if(totalTickets <= 0){
      throw new InvalidPurchaseException("At least one ticket must be purchased");
    }else

    if(numAdultTickets <= 0){
      throw new InvalidPurchaseException("At least one adult ticket must be purchased");
    }
  }

  _calculatePaymentAndSeats(ticketTypeRequest) {
    const numChildTickets = ticketTypeRequest.child;
    const numAdultTickets = ticketTypeRequest.adult;

    const amount =
      numChildTickets * TicketTypeRequest.prices.CHILD +
      numAdultTickets * TicketTypeRequest.prices.ADULT;
    const seats = numChildTickets + numAdultTickets;

    return { amount, seats };
  }

  _validateId(id){
    if(!Number.isInteger(id)){
      throw new InvalidPurchaseException("Invalid ticket id");
    }
  }
}
