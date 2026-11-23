export const UserDetails = ({ member }) => {
  // Nothing selected yet, so show a hint instead of crashing on member.firstName
  if (!member) {
    return <p className="text-muted">Select a member to see details</p>;
  }

  return (
    <div className="card">
      <div className="card-body">
        <h3>{member.firstName} {member.lastName}</h3>
            <p>Email: {member.email}</p>
            <p>Phone: {member.phone}</p>
            <p>City: {member.address.city}</p>
            <p>Company: {member.company.name}</p>
      </div>
    </div>
  );
};