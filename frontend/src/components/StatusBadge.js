import React from 'react';

const map = {
  pending:          { cls:'badge badge-pending',  label:'Pending' },
  sent:             { cls:'badge badge-sent',     label:'Sent' },
  failed:           { cls:'badge badge-failed',   label:'Failed' },
  waiting_approval: { cls:'badge badge-waiting',  label:'Waiting Approval' },
};

export default function StatusBadge({ status }) {
  const { cls, label } = map[status] || map.pending;
  return <span className={cls}>{label}</span>;
}
