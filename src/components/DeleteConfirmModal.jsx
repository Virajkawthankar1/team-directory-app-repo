// Bootstrap modal controlled by React: shown only when `member` is not null
export const DeleteConfirmModal = ({ member, isDeleting, error, onCancel, onConfirm }) => {
  if (!member) return null;   // nothing to confirm, so render nothing

  return (
    <>
      <div className="modal d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirm delete</h5>
            </div>

            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              Are you sure you want to delete{" "}
              <strong>{member.firstName} {member.lastName}</strong>?
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onCancel} disabled={isDeleting}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={onConfirm} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dark overlay behind the modal */}
      <div className="modal-backdrop show"></div>
    </>
  );
};