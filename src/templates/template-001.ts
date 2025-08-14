import { Milestone } from "../models/Milestone";
import { Process } from "../models/Process";
import { Project } from "../models/Project";
import { Task } from "../models/Task";

/**
 * Generates a predefined Project instance mirroring the "template00" JSON structure.
 * @returns {Project} The manually constructed Project object.
 */
export function getTemplate001() {
    const project = new Project('t001', new Date());
    project.setTitle('Template 001');
    project.setSubtitle('Solicitud de suministro en MT con SB');

    const root = project.getRoot();
    const startMilestone = project.getStartMilestone();

    // Process 1: Otros - cliente
    const p1 = new Process(1, 'Otros - cliente', root);
    project.addItem(p1, root);
    project.addRelation(startMilestone, p1);

    const m11 = new Milestone(11, 'Pago de carpeta', p1);
    project.addItem(m11, p1);

    const m12 = new Milestone(12, 'DAR', p1);
    project.addItem(m12, p1);
    
    // Process 2: Proyectos
    const p2 = new Process(2, 'Proyectos', root);
    project.addItem(p2, root);
    project.addRelation(startMilestone, p2);

    const t21 = new Task(21, 'Informe Tecnico', 5, p2, 'Informe Técnico + Envío a Estudios');
    project.addItem(t21, p2);
    project.addRelation(startMilestone, t21);

    const t22 = new Task(22, 'Presupuesto', 10, p2, 'Termina con la confirmación de la carpeta');
    t22.setManualDuration(10);
    project.addItem(t22, p2);
    project.addRelation(startMilestone, t22);
    project.addRelation(t21, t22);
    project.addRelation(t22, m11);

    // Process 3: Local para Subestación
    const p3 = new Process(3, 'Local para Subestación', root);
    project.addItem(p3, root);
    project.addRelation(startMilestone, p3);
    project.addRelation(t21, p3);

    // Process 31: Visto Bueno Proyectos (child of p3)
    const p31 = new Process(31, 'Visto Bueno Proyectos');
    project.addItem(p31, p3);
    project.addRelation(startMilestone, p31);
    project.addRelation(t21, p31);

    const t311 = new Task(311, 'Aprobación proyecto', 10);
    project.addItem(t311, p31);
    project.addRelation(startMilestone, t311);
    project.addRelation(t21, t311);

    const t312 = new Task(312, 'Aprobación proy SPAT', 10, p31);
    project.addItem(t312, p31);
    project.addRelation(startMilestone, t312);
    project.addRelation(t21, t312);

    // Process 32: Visto Bueno Obras (child of p3)
    const p32 = new Process(32, 'Visto Bueno Obras', root);
    project.addItem(p32, p3);
    project.addRelation(startMilestone, p32);
    project.addRelation(t21, p32);

    const t321 = new Task(321, 'Obra Civil del Local', 60);
    project.addItem(t321, p32);
    project.addRelation(startMilestone, t321);
    project.addRelation(t21, t321);
    project.addRelation(t311, t321);

    const t322 = new Task(322, 'Medidas de TP y TC', 5, p32, 'Medidas de tensión de paso y contacto.');
    project.addItem(t322, p32);
    project.addRelation(startMilestone, t322);
    project.addRelation(t21, t322);
    project.addRelation(t321, t322);

    const t323 = new Task(323, 'Presentación de documentación', 5, p32);
    project.addItem(t323, p32);
    project.addRelation(startMilestone, t323);
    project.addRelation(t21, t323);
    project.addRelation(t311, t323);
    project.addRelation(t312, t323);
    project.addRelation(p31, t323);
    project.addRelation(t321, t323);
    project.addRelation(t322, t323);

    const m324 = new Milestone(324, 'Visto bueno local OB', p32);
    project.addItem(m324, p32);
    project.addRelation(startMilestone, m324);
    project.addRelation(t21, m324);
    project.addRelation(t311, m324);
    project.addRelation(t312, m324);
    project.addRelation(p31, m324);
    project.addRelation(t323, m324);

    const t33 = new Task(33, 'Contrato Comodato', 45, p3);
    project.addItem(t33, p3);
    project.addRelation(startMilestone, t33);
    project.addRelation(t21, t33);

    // Process 4: Instalación enlace MT
    const p4 = new Process(4, 'Instalación enlace MT', root, 'Obras eléctricas');
    project.addItem(p4, root);
    project.addRelation(startMilestone, p4);

    const t41 = new Task(41, 'Envío correo PCV', 5, p4, 'Se envía al cliente los requerimientos tecnicos para la puesta en servicio de su instalacion interior.\nCeldas UTE\nEnsayos requeridos en CMT');
    project.addItem(t41, p4);
    project.addRelation(startMilestone, t41);
    project.addRelation(m11, t41);

    // Process 42: Cliente levanta PCV (child of p4)
    const p42 = new Process(42, 'Cliente levanta PCV', p4);
    project.addItem(p42, p4);
    project.addRelation(startMilestone, p42);
    project.addRelation(t41, p42);

    const t421 = new Task(421, 'CMT y Terminales', 15, p42, 'Cliente debe:\nobtener materiales\nrealizar tendido del CMT y montaje de terminales');
    project.addItem(t421, p42);
    project.addRelation(startMilestone, t421);
    project.addRelation(t41, t421);

    const t422 = new Task(422, 'Aprobación ensayo CMT', 5, p42, 'Coordinación de ensayos y presentación de informe');
    project.addItem(t422, p42);
    project.addRelation(startMilestone, t422);
    project.addRelation(t41, t422);
    project.addRelation(t421, t422);

    // Process 5: Obras
    const p5 = new Process(5, 'Obras', root);
    project.addItem(p5, root);
    project.addRelation(startMilestone, p5);
    project.addRelation(m11, p5);
    project.addRelation(m324, p5);

    const t51 = new Task(51, 'Montaje SB', 5, p5);
    project.addItem(t51, p5);
    project.addRelation(startMilestone, t51);
    project.addRelation(m11, t51);
    project.addRelation(m324, t51);

    const t52 = new Task(52, 'Otros (tendidos)', 10, p5);
    project.addItem(t52, p5);
    project.addRelation(startMilestone, t52);
    project.addRelation(m11, t52);

    const t53 = new Task(53, 'Corte-(Energización/Conexión)', 1, p5);
    project.addItem(t53, p5);
    project.addRelation(startMilestone, t53);
    project.addRelation(m11, t53);
    project.addRelation(t33, t53);
    project.addRelation(t51, t53);
    project.addRelation(t52, t53);

    const m54 = new Milestone(54, 'Act 78', p5);
    project.addItem(m54, p5);
    project.addRelation(startMilestone, m54);
    project.addRelation(m11, m54);
    project.addRelation(m12, m54);
    project.addRelation(t53, m54);

    // Process 6: Protecciones - Comercial
    const p6 = new Process(6, 'Protecciones - Comercial', root);
    project.addItem(p6, root);
    project.addRelation(startMilestone, p6);

    const t61 = new Task(61, 'Configuración Relé CCC', 5, p6);
    project.addItem(t61, p6);
    project.addRelation(startMilestone, t61);
    project.addRelation(m11, t61);

    const t62 = new Task(62, 'Relevamiento medida', 1, p6);
    project.addItem(t62, p6);
    project.addRelation(startMilestone, t62);
    project.addRelation(m11, t62);


    // Establish remaining relations to End Milestone (1002) and other inter-process dependencies
    project.addRelation(m324, m12);
    project.addRelation(t421, m12);
    project.addRelation(t422, m12);
    project.addRelation(p42, m12); // P42 to m12

    project.addRelation(t62, m54); // Relation from t62 to m54

    return project;
}