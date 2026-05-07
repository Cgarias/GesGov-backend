export enum DocumentStatus {
  PENDIENTE  = 'PENDIENTE',   // Sin fecha de respuesta aún
  EN_PROCESO = 'EN_PROCESO',  // Fecha asignada, tiempo vigente
  POR_VENCER = 'POR_VENCER',  // Vence en <= 3 días
  VENCIDO    = 'VENCIDO',     // Fecha de respuesta superada
  RESPONDIDO = 'RESPONDIDO',  // Marcado como respondido
}
