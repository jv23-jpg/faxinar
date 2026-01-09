export async function auditLog({ actor, action, entity, entity_id, details = {} }) {
  try {
    if (typeof window !== 'undefined' && window.base44 && window.base44.entities && window.base44.entities.AuditLog && window.base44.entities.AuditLog.create) {
      await window.base44.entities.AuditLog.create({ actor, action, entity, entity_id, details, created_at: new Date().toISOString() });
      return true;
    }
    console.info('AuditLog entity not available; skipping audit creation.');
    return false;
  } catch (err) {
    console.warn('auditLog error:', err);
    return false;
  }
}
