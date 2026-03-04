"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hr_controller_1 = require("./hr.controller");
const setup_1 = require("../../test/setup");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
jest.mock('bcryptjs');
describe('HRController', () => {
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
        };
        jest.clearAllMocks();
    });
    describe('createStaff', () => {
        it('doit créer un employé (User + Staff) en transaction', async () => {
            req = {
                body: {
                    email: 'teacher@ecole.sn',
                    firstName: 'Amadou',
                    lastName: 'Sow',
                    schoolId: validUUID,
                    role: 'PROFESSEUR',
                    salary: 300000,
                    contractType: 'CDI'
                },
                // @ts-ignore
                user: { tenantId: 'tenant-1' }
            };
            const mockUser = { id: 'user-1', email: 'teacher@ecole.sn' };
            const mockStaff = { id: 'staff-1', userId: 'user-1', ...req.body };
            bcryptjs_1.default.hash.mockResolvedValue('hashed');
            // @ts-ignore
            setup_1.prismaMock.$transaction.mockImplementation(async (callback) => {
                return callback(setup_1.prismaMock);
            });
            // @ts-ignore
            setup_1.prismaMock.user.create.mockResolvedValue(mockUser);
            // @ts-ignore
            setup_1.prismaMock.staff.create.mockResolvedValue(mockStaff);
            await hr_controller_1.HRController.createStaff(req, res);
            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith(mockStaff);
        });
    });
    describe('generatePayroll', () => {
        it(`doit calculer la masse salariale d'une école`, async () => {
            req = {
                body: {
                    schoolId: validUUID,
                    month: 1,
                    year: 2026
                }
            };
            const mockStaffList = [
                { id: '1', salary: 100000 },
                { id: '2', salary: 200000 }
            ];
            // @ts-ignore
            setup_1.prismaMock.staff.findMany.mockResolvedValue(mockStaffList);
            await hr_controller_1.HRController.generatePayroll(req, res);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
                totalAmount: 300000,
                staffCount: 2
            }));
        });
    });
});
