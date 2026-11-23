export const UserCard = ({ member, onSelect, onDeleteRequest, isSelected }) => (
  <div
    className={`card h-100 ${isSelected ? "border-primary" : ""}`}
    onClick={() => onSelect(member)}
    style={{ cursor: "pointer" }}
  >
    <div className="card-body d-flex align-items-center gap-3">
      <img
        src={member.image}
        alt={member.firstName}
        width="64"
        height="64"
        className="rounded-circle"
      />
      <div className="flex-grow-1">
        <h6 className="mb-0">{member.firstName} {member.lastName}</h6>
        <small className="text-muted">{member.email}</small>
      </div>

      <button
        className="btn btn-sm btn-outline-danger"
        onClick={(e) => {
          e.stopPropagation();       // stop the click from reaching the card's onClick
          onDeleteRequest(member);   // ask the parent to open the confirm modal
        }}
      >
        Delete
      </button>
    </div>
  </div>
);