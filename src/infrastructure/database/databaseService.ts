import { SchoolDataPort } from '../../application/ports/SchoolDataPort';
import { TeacherNotesOperations } from './TeacherNotesOperations';

export class SchoolDataService extends TeacherNotesOperations implements SchoolDataPort {}

export const dbService = new SchoolDataService();
