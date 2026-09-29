import { SchoolDataPort } from './ports/SchoolDataPort';

let implementation: SchoolDataPort | undefined;

export function configureSchoolData(port: SchoolDataPort): void {
  implementation = port;
}

export const schoolData: SchoolDataPort = new Proxy({} as SchoolDataPort, {
  get(_target, property: keyof SchoolDataPort) {
    if (!implementation) {
      throw new Error('SchoolDataPort no está configurado. Configúralo en el punto de entrada de la aplicación.');
    }

    const value = implementation[property];
    return typeof value === 'function' ? value.bind(implementation) : value;
  },
});
