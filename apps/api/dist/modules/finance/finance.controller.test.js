"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const finance_controller_1 = require("./finance.controller");
const setup_1 = require("../../test/setup");
describe('FinanceController', () => {
    let req;
    let res;
    let jsonMock;
    let statusMock;
    const validUUID = '550e8400-e29b-41d4-a716-446655440000';
    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnThis();
        res = {
            json: jsonMock,
            status: statusMock,
            send: jest.fn()
        };
        jest.clearAllMocks();
    });
    describe('initiate', () => {
        it('doit initier un paiement par WAVE avec succès', async () => {
            req = {
                body: {
                    enrollmentId: validUUID,
                    amount: 50000,
                    method: 'WAVE'
                }
            };
            const mockPayment = {
                id: 'pay-1',
                enrollmentId: validUUID,
                amount: 50000,
                method: 'WAVE',
                status: 'PENDING'
            };
            // @ts-ignore
            setup_1.prismaMock.payment.create.mockResolvedValue(mockPayment);
            await finance_controller_1.FinanceController.initiate(req, res);
            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
                payment: mockPayment,
                checkoutUrl: expect.stringContaining('checkout.wave.sn')
            }));
        });
        it('doit confirmer immédiatement un paiement en CASH', async () => {
            req = {
                body: {
                    enrollmentId: validUUID,
                    amount: 50000,
                    method: 'CASH'
                }
            };
            const mockPayment = {
                id: 'pay-1',
                enrollmentId: validUUID,
                amount: 50000,
                method: 'CASH',
                status: 'COMPLETED'
            };
            // @ts-ignore
            setup_1.prismaMock.payment.create.mockResolvedValue(mockPayment);
            await finance_controller_1.FinanceController.initiate(req, res);
            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
                payment: mockPayment,
                checkoutUrl: null
            }));
        });
    });
});
