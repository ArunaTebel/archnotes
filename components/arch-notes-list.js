import React from 'react';
import {Card, Result, Tree, Tooltip, Form, Input, Popconfirm,} from 'antd';
import {DownOutlined, SmileOutlined, FileTextOutlined, DeleteOutlined, FolderAddOutlined, EditOutlined, MailOutlined} from '@ant-design/icons';
import classnames from "classnames";
import styles from "../styles/ArchNotesList.module.css";
import ArchNotesService from "../util/arch-notes-service";
import ArchAuth from "../util/arch-auth";
import ArchFormModal from "./util/arch-form-modal";
import ArchMessage from "../util/arch-message";
import ModalUtil from "./util/arch-notes-list-modal-util";

const _ = require('lodash');


class ArchNotesList extends React.Component {

    state = {
        selectedItem: null,
        selectedNote: null,
        modalProps: {
            addEditModal: ModalUtil.addEditModal.props,
            sendNoteViaEmailModal: ModalUtil.sendNoteViaEmailModal.props
        }
    };

    constructor(props) {
        super(props);
        this.onAction = this.onAction.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.updateModalProps = this.updateModalProps.bind(this);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.deleteSelectedItem = this.deleteSelectedItem.bind(this);
        this.onDragAndDropItem = this.onDragAndDropItem.bind(this);
    }

    updateModalProps(modalName, customProps) {
        const newStateModalProps = _.clone(this.state.modalProps);
        newStateModalProps[modalName] = {...newStateModalProps[modalName], ...customProps};
        this.setState({modalProps: newStateModalProps});
    }

    openModal(modalName, customProps = {visible: true}) {
        this.updateModalProps(modalName, customProps);
    }

    closeModal(modalName, customProps = {visible: false, initialValues: {}}) {
        this.updateModalProps(modalName, customProps);
    }

    onAction(action) {
        const selectedItem = this.state.selectedItem;
        if (action === 'addDirectory' || action === 'addNote') {
            const isAddDir = action === 'addDirectory';
            this.openModal('addEditModal', {
                visible: true,
                title: `Create ${isAddDir ? 'Directory' : 'Note'}`,
                modalText: `Create a ${isAddDir ? 'directory' : 'note'} ${selectedItem && selectedItem.type === ArchNotesService.ITEM_TYPE_DIRECTORY ? `under '${selectedItem.name}'` : ''}`,
                onFormSubmitSuccess: isAddDir ? ModalUtil.modalFormActionHandlers.createDirectory : ModalUtil.modalFormActionHandlers.createNote,
                onFormSubmitError: ModalUtil.modalFormActionHandlers.onError,
            });
        } else if (action === 'rename') {
            if (selectedItem) {
                const isDirectory = selectedItem.type === ArchNotesService.ITEM_TYPE_DIRECTORY;
                this.openModal('addEditModal', {
                    visible: true,
                    title: isDirectory ? 'Rename Directory' : 'Rename Note',
                    modalText: `Rename ${isDirectory ? 'directory' : 'note'} '${selectedItem.name}'`,
                    initialValues: {name: selectedItem.name},
                    onFormSubmitSuccess: isDirectory ? ModalUtil.modalFormActionHandlers.renameDirectory : ModalUtil.modalFormActionHandlers.renameNote,
                    onFormSubmitError: ModalUtil.modalFormActionHandlers.onError,
                });
            } else {
                ArchMessage.info('No item selected');
            }
        } else if (action === 'sendViaEmail') {
            if (selectedItem && selectedItem.type === ArchNotesService.ITEM_TYPE_NOTE) {
                this.openModal('sendNoteViaEmailModal', {
                    visible: true,
                    modalText: `Type the email address of the recipient you want to send the note '${selectedItem.name}'`,
                    initialValues: {email: 'aruna@orangehrmlive.com'},
                    onFormSubmitSuccess: ModalUtil.modalFormActionHandlers.sendNoteViaEmail,
                    onFormSubmitError: ModalUtil.modalFormActionHandlers.onError,
                });
            } else {
                ArchMessage.info('No item selected');
            }
        }
    }

    async onSelect(itemUid, event) {
        if (event.selected) {
            const newState = {selectedItem: {type: event.node.type, uid: itemUid[0], name: event.node.title}};
            if (event.node.type === ArchNotesService.ITEM_TYPE_NOTE) {
                const selectedNote = await ArchNotesService.fetchNoteById(ArchAuth.getCurrentUser().uid, itemUid[0]);
                newState['selectedNote'] = {...selectedNote.data(), 'id': selectedNote.id};
                this.props.onSelectNote({...selectedNote.data(), 'id': selectedNote.id});
            }
            this.setState(newState);
        } else {
            this.setState({selectedItem: null})
        }
    }

    async deleteSelectedItem() {
        const selectedItem = this.state.selectedItem;
        if (selectedItem && selectedItem.uid) {
            let funcName;
            if (selectedItem.type === ArchNotesService.ITEM_TYPE_DIRECTORY) {
                funcName = 'deleteDirectory';
            } else {
                funcName = 'deleteNote';
            }
            await ArchNotesService[funcName](ArchAuth.getCurrentUser().uid, selectedItem.uid);
            ArchMessage.success(`Successfully deleted '${selectedItem.name}'`);
            this.setState({selectedItem: null});
            return this.props.onNoteListChange();
        } else {
            ArchMessage.info('No item selected');
        }
    }

    async onDragAndDropItem(event) {
        const draggedItem = event.dragNode;
        const parentItem = event.node;
        if (parentItem.type === ArchNotesService.ITEM_TYPE_DIRECTORY || event.dropPosition === -1) {
            let parentId = parentItem.key;
            if (event.dropPosition === -1) {
                parentId = null;
            }
            if (draggedItem.type === ArchNotesService.ITEM_TYPE_DIRECTORY) {
                await ArchNotesService.moveDirectoryOfUserToParent(ArchAuth.getCurrentUser().uid, draggedItem.key, parentId);
            } else {
                await ArchNotesService.moveNoteOfUserToDirectory(ArchAuth.getCurrentUser().uid, draggedItem.key, parentId);
            }
            ArchMessage.success(`Successfully moved '${draggedItem.title}' to ${parentItem.title && parentId ? `'${parentItem.title}'` : 'top'}`);
        }
        this.props.onNoteListChange();
    }

    render() {
        let actionItems = [];
        if (this.props.loggedInUser) {
            actionItems = [
                <Tooltip placement="bottom" title="Delete Item">
                    <Popconfirm
                        disabled={this.state.selectedItem === null}
                        placement='right'
                        title="Are you sure delete this item?"
                        onConfirm={this.deleteSelectedItem}
                        onCancel={() => {
                        }}
                        okText="Yes"
                        cancelText="No">
                        <DeleteOutlined onClick={() => this.onAction('delete')} key="delete"/>
                    </Popconfirm>
                </Tooltip>,
                <Tooltip placement="bottom" title="Add new directory">
                    <FolderAddOutlined onClick={() => this.onAction('addDirectory')} key="addDirectory"/>
                </Tooltip>,
                <Tooltip placement="bottom" title="Add new note">
                    <FileTextOutlined onClick={() => this.onAction('addNote')} key="addNote"/>
                </Tooltip>,
                <Tooltip placement="bottom" title="Rename Item">
                    <EditOutlined onClick={() => this.onAction('rename')} key="rename"/>
                </Tooltip>,
                <Tooltip placement="bottom" title="Send Note via Email">
                    <MailOutlined onClick={() => this.onAction('sendViaEmail')} key="sendViaEmail"/>
                </Tooltip>,
            ]
        }
        const addEditModalProps = this.state.modalProps.addEditModal;
        const sendNoteViaEmailModalProps = this.state.modalProps.sendNoteViaEmailModal;
        return (
            <div>
                <Card className='arch-noteslist-placeholder-card' actions={actionItems}/>
                <Card size='small' className={classnames(styles.notesListCard)} loading={this.props.loading}>
                    <Tree
                        draggable
                        blockNode
                        onDrop={this.onDragAndDropItem}
                        showLine={{showLeafIcon: false}}
                        showIcon
                        switcherIcon={<DownOutlined/>}
                        defaultExpandAll
                        onSelect={this.onSelect}
                        treeData={this.props.notesAndDirectories}
                        selectedKeys={this.state.selectedItem ? [this.state.selectedItem.uid] : []}
                    />
                    {this.props.loggedInUser ? '' : <Result icon={<SmileOutlined/>} title="Sign in to start creating notes"/>}
                </Card>
                <ArchFormModal id={addEditModalProps.id}
                               title={addEditModalProps.title}
                               visible={addEditModalProps.visible}
                               onCancel={() => this.closeModal('addEditModal')}
                               onOkValid={(values) => addEditModalProps.onFormSubmitSuccess(this, values)}
                               onOkInValid={(errors) => addEditModalProps.onFormSubmitError(this, errors)}
                               formInitialValues={addEditModalProps.initialValues}
                               formName={addEditModalProps.name}>
                    <p>{addEditModalProps.modalText}</p>
                    <Form.Item name="name" rules={[{required: true, message: 'Required'}]}>
                        <Input/>
                    </Form.Item>
                </ArchFormModal>
                <ArchFormModal id={sendNoteViaEmailModalProps.id}
                               title={sendNoteViaEmailModalProps.title}
                               visible={sendNoteViaEmailModalProps.visible}
                               onCancel={() => this.closeModal('sendNoteViaEmailModal')}
                               onOkValid={(values) => sendNoteViaEmailModalProps.onFormSubmitSuccess(this, values)}
                               onOkInValid={(errors) => sendNoteViaEmailModalProps.onFormSubmitError(this, errors)}
                               formInitialValues={sendNoteViaEmailModalProps.initialValues}
                               formName={sendNoteViaEmailModalProps.name}>
                    <p>{sendNoteViaEmailModalProps.modalText}</p>
                    <Form.Item name="email" rules={[{required: true, message: 'Required'}, {type: 'email', message: 'Should be a valid email'}]}>
                        <Input type={'email'}/>
                    </Form.Item>
                </ArchFormModal>
            </div>
        );
    }

}

export default ArchNotesList;