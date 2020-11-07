import ArchNotesService from "../../util/arch-notes-service";
import ArchAuth from "../../util/arch-auth";
import ArchMessage from "../../util/arch-message";

const ModalUtil = {
    addEditModal: {
        props: {
            visible: false,
            id: 'add_edit_modal',
            title: 'Add Item',
            name: 'add_edit_modal',
            modalText: '',
            initialValues: {},
            onFormSubmitSuccess: () => {
            },
            onFormSubmitError: () => {
            },
        }
    },
    sendNoteViaEmailModal: {
        props: {
            visible: false,
            id: 'sent_note_via_email_modal',
            title: 'Send Note via Email',
            name: 'sent_note_via_email_modal',
            modalText: 'Type the email address of the recipient you want to send the note',
            initialValues: {},
            onFormSubmitSuccess: () => {
            },
            onFormSubmitError: () => {
            },
        }
    },
    modalFormActionHandlers: {
        createDirectory: async (archNotesListComponent, values) => {
            return ModalUtil.modalFormActionHandlers.createItem(archNotesListComponent, values, 'createDirectory');
        },
        createNote: async (archNotesListComponent, values) => {
            return ModalUtil.modalFormActionHandlers.createItem(archNotesListComponent, values, 'createNote');
        },
        renameDirectory: async (archNotesListComponent, values) => {
            return ModalUtil.modalFormActionHandlers.renameItem(archNotesListComponent, values, 'renameDirectory');
        },
        renameNote: async (archNotesListComponent, values) => {
            return ModalUtil.modalFormActionHandlers.renameItem(archNotesListComponent, values, 'renameNote');
        },
        createItem: async (archNotesListComponent, values, funcName) => {
            const selectedItem = archNotesListComponent.state.selectedItem;
            const name = values.name;
            const parentDirId = selectedItem ? selectedItem.uid : null;
            const createdItem = await ArchNotesService[funcName](ArchAuth.getCurrentUser().uid, name, parentDirId);
            if (createdItem.id) {
                archNotesListComponent.closeModal('addEditModal');
                ArchMessage.success(`Successfully created '${name}'`);
                return archNotesListComponent.props.onNoteListChange();
            }
            return false;
        },
        renameItem: async (archNotesListComponent, values, funcName) => {
            const selectedItem = archNotesListComponent.state.selectedItem;
            if (selectedItem && selectedItem.uid) {
                const newName = values.name;
                await ArchNotesService[funcName](ArchAuth.getCurrentUser().uid, selectedItem.uid, newName);
                archNotesListComponent.closeModal('addEditModal');
                ArchMessage.success(`Successfully renamed '${selectedItem.name}' to '${newName}'`);
                archNotesListComponent.setState({selectedItem: null});
                return archNotesListComponent.props.onNoteListChange();
            }
            return false;
        },

        sendNoteViaEmail: async (archNotesListComponent, values) => {
            const selectedNote = archNotesListComponent.state.selectedNote;
            const result = await ArchNotesService.sendNoteToEmail(ArchAuth.getCurrentUser().uid, values.email, selectedNote);
            if (result && result.data && result.data.messageId) {
                ArchMessage.success(`Successfully sent the '${selectedNote.title}' to '${values.email}'`);
                archNotesListComponent.closeModal('sendNoteViaEmailModal');
                return true;
            }
            return false;
        },

        onError: (archNotesListComponent, errors) => {
            ArchMessage.error('Error occurred');
        }
    }
}

export default ModalUtil;
