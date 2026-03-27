class ActivityLog {
  constructor({
    id,
    action,
    entity_type,
    entity_id,
    description,
    user_id,
    timestamp,
  }) {
    this.id = id;
    this.action = action;
    this.entity_type = entity_type;
    this.entity_id = entity_id;
    this.description = description;
    this.user_id = user_id;
    this.timestamp = timestamp || new Date().toISOString();
  }
}

export default ActivityLog;
