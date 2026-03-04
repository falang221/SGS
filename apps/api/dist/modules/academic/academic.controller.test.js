"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const academic_controller_1 = require("./academic.controller");
const setup_1 = require("../../test/setup");
describe('AcademicController', () => {
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
    describe('createSubject', () => {
        it('doit créer une matière avec succès', async () => {
            req = {
                body: {
                    name: 'Mathématiques',
                    code: 'MATH01',
                    coefficient: 4,
                    schoolId: validUUID
                }
            };
            const mockSubject = { id: 'subj-1', ...req.body };
            // @ts-ignore
            setup_1.prismaMock.subject.create.mockResolvedValue(mockSubject);
            await academic_controller_1.AcademicController.createSubject(req, res);
            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith(mockSubject);
        });
    });
    describe('createTimetableEntry', () => {
        it(`doit créer un créneau d'emploi du temps s'il n'y a pas de conflit`, async () => {
            req = {
                body: {
                    classId: validUUID,
                    subjectId: validUUID,
                    staffId: validUUID,
                    dayOfWeek: 1,
                    startTime: '08:00',
                    endTime: '10:00',
                    room: 'Salle 101'
                }
            };
            // @ts-ignore
            setup_1.prismaMock.timetableEntry.findFirst.mockResolvedValue(null);
            // @ts-ignore
            setup_1.prismaMock.timetableEntry.create.mockResolvedValue({ id: 'entry-1', ...req.body });
            await academic_controller_1.AcademicController.createTimetableEntry(req, res);
            expect(statusMock).toHaveBeenCalledWith(201);
        });
        it(`doit retourner 409 en cas de conflit d'emploi du temps`, async () => {
            req = {
                body: {
                    classId: validUUID,
                    subjectId: validUUID,
                    staffId: validUUID,
                    dayOfWeek: 1,
                    startTime: '08:00',
                    endTime: '10:00',
                    room: 'Salle 101'
                }
            };
            // @ts-ignore
            setup_1.prismaMock.timetableEntry.findFirst.mockResolvedValue({ id: 'existing-entry' });
            await academic_controller_1.AcademicController.createTimetableEntry(req, res);
            expect(statusMock).toHaveBeenCalledWith(409);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Conflit') }));
        });
    });
});
