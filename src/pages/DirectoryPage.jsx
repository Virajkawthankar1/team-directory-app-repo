import { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { SearchBar } from "../components/SearchBar";
import { UserList } from "../components/UserList";
import { UserDetails } from "../components/UserDetails";
import { AddUserForm } from "../components/AddUserForm";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { getMembers, deleteMember } from "../services/api";
import { useAuth } from "../context/AuthContext";

export const DirectoryPage = () => {
    const [members, setMembers] = useState([]);          // starts empty, filled by the API
    const [loading, setLoading] = useState(true);        // true until the request finishes
    const [error, setError] = useState("");              // friendly error message
    const [searchText, setSearchText] = useState("");
    const [selectedMember, setSelectedMember] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [successKey, setSuccessKey] = useState(0);   // changes on every add, so the timer restarts
    const [memberToDelete, setMemberToDelete] = useState(null);   // member awaiting confirmation
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const { accessToken } = useAuth();

    // Load members once when the page opens ([] = run only on mount)
    useEffect(() => {
        const controller = new AbortController();

        const loadMembers = async () => {
            try {
                const data = await getMembers(accessToken, controller.signal);
                setMembers(data);
            } catch (err) {
                // A cancelled request is not a real error, so ignore it
                if (err.name === "AbortError") return;
                setError("Could not load members. Please try again.");
            } finally {
                // Skip the update if the component was unmounted/cancelled
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        loadMembers();

        // Cleanup: cancel the request if the component unmounts first
        return () => controller.abort();
    }, [accessToken]);

    // Update the browser tab title whenever the member count changes
    useEffect(() => {
        document.title = `Team Directory (${members.length} members)`;
    }, [members.length]);   // runs only when the count changes

    // Hide the success message automatically after 3 seconds
    useEffect(() => {
        if (!successMessage) return;                 // nothing to hide yet

        const timerId = setTimeout(() => setSuccessMessage(""), 3000);

        // Cleanup: clear the timer if the message changes or the page unmounts
        return () => clearTimeout(timerId);
    }, [successMessage, successKey]);                          // runs only when the message changes

    const handleSelect = (member) => setSelectedMember(member);

    // Show a success message and restart the 3-second hide timer
    const showSuccess = (text) => {
        setSuccessMessage(text);
        setSuccessKey((k) => k + 1);
    };

    const handleAddMember = (newMember) => {
        setMembers((prev) => [...prev, newMember]);
        showSuccess("Member added successfully");
    };

    //delete member code
    // Delete button clicked on a card: open the modal
    const handleDeleteRequest = (member) => {
        setDeleteError("");
        setMemberToDelete(member);
    };

    // Cancel clicked: close the modal
    const handleCancelDelete = () => setMemberToDelete(null);

    // Confirm clicked: call the API, then update the list
    const handleConfirmDelete = async () => {
        const target = memberToDelete;
        setIsDeleting(true);
        setDeleteError("");

        try {
            // Members added in the browser don't exist on the server, so skip the API call
            if (!target.isLocal) {
                await deleteMember(accessToken, target.id);
            }

            // filter() builds a NEW array without the deleted member (no mutation)
            setMembers((prev) => prev.filter((m) => m.id !== target.id));

            // If the deleted member is shown in the details panel, clear the panel
            setSelectedMember((prev) => (prev?.id === target.id ? null : prev));

            setMemberToDelete(null);              // close the modal
            showSuccess("Member deleted successfully");
        } catch (err) {
            setDeleteError(err.message || "Could not delete member. Please try again.");  // modal stays open
        } finally {
            setIsDeleting(false);
        }
    };

    // Derived data: calculated from state on every render, not stored in state
    const filteredMembers = members.filter((m) =>
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div className="container py-3">
            <h1>Directory Page</h1>
            <Navbar memberCount={members.length} />
            <SearchBar searchText={searchText} onSearchChange={setSearchText} />

            {successMessage && (
                <div className="alert alert-success">{successMessage}</div>
            )}

            {/* Loading state */}
            {loading && (
                <div className="text-center my-5">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {/* Error state */}
            {!loading && error && <div className="alert alert-danger">{error}</div>}

            {/* Success state (also handles an empty list inside UserList) */}
            {!loading && !error && (
                <div className="row">
                    <div className="col-md-8">
                        <UserList
                            members={filteredMembers}
                            onSelect={handleSelect}
                            onDeleteRequest={handleDeleteRequest}
                            totalCount={members.length}
                            selectedId={selectedMember?.id}
                        />
                    </div>
                    <div className="col-md-4">
                        <UserDetails member={selectedMember} />
                    </div>
                </div>
            )}

            <AddUserForm members={members} onAdd={handleAddMember} />
            <DeleteConfirmModal
                member={memberToDelete}
                isDeleting={isDeleting}
                error={deleteError}
                onCancel={handleCancelDelete}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
};