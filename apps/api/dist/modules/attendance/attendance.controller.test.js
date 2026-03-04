"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const attendance_controller_1 = require("./attendance.controller");
const setup_1 = require("../../test/setup");
describe('AttendanceController', () => {
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
    describe('submitBulk', () => {
        it(`doit enregistrer plusieurs présences d'un coup`, async () => {
            req = {
                body: [
                    { enrollmentId: validUUID, status: 'PRESENT', date: new Date().toISOString() },
                    { enrollmentId: validUUID, status: 'ABSENT', date: new Date().toISOString() }
                ],
                // @ts-ignore
                user: { id: 'teacher-1', tenantId: 'tenant-1' }
            };
            const mockRecord = {
                id: '1',
                status: 'PRESENT',
                enrollment: { student: { firstName: 'A', parentId: null } }
            };
            // @ts-ignore
            setup_1.prismaMock.$transaction.mockResolvedValue([mockRecord, { ...mockRecord, status: 'ABSENT' }]);
            await attendance_controller_1.AttendanceController.submitBulk(req, res);
            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith({ message: '2 présences enregistrées.' });
        });
    });
});
