import { UserCard } from "./UserCard";

export const UserList = ({ members, onSelect, onDeleteRequest, totalCount, selectedId }) => (
  <div>
    <h4>Team Members</h4>
    <p className="text-muted">Showing {members.length} of {totalCount}</p>
    {members.length === 0 && <div className="alert alert-info">No members found</div>}
    <div className="row g-3">
      {members.map((m) => (
        <div className="col-sm-6" key={m.id}>
          <UserCard
            member={m}
            onSelect={onSelect}
            onDeleteRequest={onDeleteRequest}
            isSelected={selectedId === m.id}
          />
        </div>
      ))}
    </div>
  </div>
);