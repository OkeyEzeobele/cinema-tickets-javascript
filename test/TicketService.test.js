import assert from "assert";
import TicketService from "../src/pairtest/TicketService.js";
import InvalidPurchaseException from "../src/pairtest/lib/InvalidPurchaseException.js";
import TicketTypeRequest from "../src/pairtest/lib/TicketTypeRequest.js";

describe("TicketService", function () {
  describe("purchaseTickets", function () {
    it("should return total amount and total seats for a valid ticket purchase", async function () {
      const ticketService = new TicketService();
      const accountId = 1;
      const ticketTypeRequest = new TicketTypeRequest({
        infant: 2,
        child: 3,
        adult: 1,
      });

      const result = await ticketService.purchaseTickets(
        accountId,
        ticketTypeRequest
      );

      assert.strictEqual(result.totalAmount, 50);
      assert.strictEqual(result.totalSeats, 4);
    });

    it("there should be a valid id", async function () {
      const ticketService = new TicketService();
      const accountId = "w";
      const ticketTypeRequest = new TicketTypeRequest({
        infant: 0,
        child: 0,
        adult: 20,
      });

      await assert.rejects(async () => {
        await ticketService.purchaseTickets(accountId, ticketTypeRequest);
      }, new InvalidPurchaseException("Invalid ticket id"));
    });

    it("should throw an error for exceeding ticket limit", async function () {
      const ticketService = new TicketService();
      const accountId = 1;
      const ticketTypeRequest = new TicketTypeRequest({
        infant: 0,
        child: 0,
        adult: 21,
      });

      await assert.rejects(async () => {
        await ticketService.purchaseTickets(accountId, ticketTypeRequest);
      }, new InvalidPurchaseException("Total number of tickets exceeds the maximum limit of 20 tickets"));
    });

    it("should throw an error for not purchasing at least one ticket", async function () {
      const ticketService = new TicketService();
      const accountId = 1;
      const ticketTypeRequest = new TicketTypeRequest({
        infant: 0,
        child: 0,
        adult: 0,
      });

      await assert.rejects(async () => {
        await ticketService.purchaseTickets(accountId, ticketTypeRequest);
      }, new InvalidPurchaseException("At least one ticket must be purchased"));
    });

    it("should throw an error for not purchasing an adult ticket", async function () {
      const ticketService = new TicketService();
      const accountId = 1;
      const ticketTypeRequest = new TicketTypeRequest({
        infant: 0,
        child: 1,
        adult: 0,
      });

      await assert.rejects(async () => {
        await ticketService.purchaseTickets(accountId, ticketTypeRequest);
      }, new InvalidPurchaseException("At least one adult ticket must be purchased"));
    });
  });
});
