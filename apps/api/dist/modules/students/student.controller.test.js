"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const student_controller_1 = require("./student.controller");
const setup_1 = require("../../test/setup");
describe('StudentController', () => {
    let req;
    let res;
    let jsonMock;
    let statusMock;
    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnThis();
        res = {
            json: jsonMock,
            status: statusMock,
        };
        jest.clearAllMocks();
    });
    describe('create', () => {
        it('doit créer un élève avec succès', async () => {
            const birthDate = new Date('2010-01-01');
            req = {
                body: {
                    firstName: 'Jean',
                    lastName: 'Dupont',
                    birthDate: birthDate.toISOString(),
                    matricule: 'MAT001',
                    schoolId: '550e8400-e29b-41d4-a716-446655440000'
                }
            };
            const mockStudent = {
                id: 'student-1',
                firstName: 'Jean',
                lastName: 'Dupont',
                birthDate,
                matricule: 'MAT001',
                schoolId: '550e8400-e29b-41d4-a716-446655440000'
            };
            // @ts-ignore
            setup_1.prismaMock.student.create.mockResolvedValue(mockStudent);
            await student_controller_1.StudentController.create(req, res);
            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith(mockStudent);
        });
        it('doit retourner 400 si les données sont invalides', async () => {
            req = {
                body: {
                    firstName: 'Jean'
                    // Manque des champs requis
                }
            };
            await student_controller_1.StudentController.create(req, res);
            expect(statusMock).toHaveBeenCalledWith(400);
        });
    });
    describe('listBySchool', () => {
        it(`doit retourner la liste des élèves d'une école`, async () => {
            req = {
                params: { schoolId: 'school-1' }
            };
            const mockStudents = [
                { id: '1', lastName: 'A', enrollments: [] },
                { id: '2', lastName: 'B', enrollments: [] }
            ];
            // @ts-ignore
            setup_1.prismaMock.student.findMany.mockResolvedValue(mockStudents);
            await student_controller_1.StudentController.listBySchool(req, res);
            expect(jsonMock).toHaveBeenCalledWith(mockStudents);
        });
    });
});
