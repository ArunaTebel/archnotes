import React from 'react'
import {Layout, Row, Col, Button, Spin} from 'antd';
import classnames from 'classnames';
import styles from '../styles/Home.module.css'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import ArchAuth from "../util/arch-auth";
import ArchNotesService from "../util/arch-notes-service";
import ArchMessage from "../util/arch-message";

import {Menu, Breadcrumb} from 'antd';
import {UserOutlined, LaptopOutlined, NotificationOutlined} from '@ant-design/icons';

const {SubMenu} = Menu;
const {Header, Content, Sider, Footer} = Layout;

const ArchNotesEditor = dynamic(() => import('../components/arch-notes-editor'), {ssr: false});
const ArchNotesList = dynamic(() => import('../components/arch-notes-list'), {ssr: false});

class Home extends React.Component {

    state = {
        loading: {notesList: true},
        loggedInUser: null,
        notesAndDirectories: [],
        selectedNote: null,
        editorContentSaveInterval: null,
        showContentSaveLoader: false
    };

    constructor(props) {
        super(props);
        this.initNotesAndDirList = this.initNotesAndDirList.bind(this);
        this.saveEditorContent = this.saveEditorContent.bind(this);
    }

    componentDidMount() {
        ArchAuth.initSignInButton('g-signin2');
        ArchAuth.onAuthStateChange(async (firebaseUser) => {
            this.setState({loggedInUser: firebaseUser});
            if (firebaseUser) {
                this.initNotesAndDirList().then();
            } else {
                this.setState({loading: {notesList: false}});
            }
        });
    }

    async saveEditorContent(editorContent) {
        if (this.state.selectedNote) {
            this.setState({showContentSaveLoader: true});
            await ArchNotesService.updateNoteContent(ArchAuth.getCurrentUser().uid, this.state.selectedNote.id, editorContent);
            this.setState({showContentSaveLoader: false});
        }
    }

    async initNotesAndDirList() {
        this.setState({
            notesAndDirectories: await ArchNotesService.fetchNotesAndDirectories(ArchAuth.getCurrentUser().uid),
            loading: {notesList: false}
        });
    }

    render() {
        const loggedInUser = this.state.loggedInUser;
        const editorContent = this.state.selectedNote ? this.state.selectedNote.content : '';
        const welcomeText = loggedInUser ? `Welcome, ${loggedInUser.displayName}` : '';
        const signInOutButton = loggedInUser ? <Button size={'small'} onClick={ArchAuth.signOut}>{loggedInUser ? 'Logout' : ''}</Button> :
            <div id="g-signin2"/>;
        const savingLoader = this.state.showContentSaveLoader ? <><Spin size='small'/> <span>Saving ...</span></> : '';
        return (
            <>
                <Head>
                    <script src="https://apis.google.com/js/platform.js" async defer/>
                    <meta name="google-signin-client_id" content="914280926964-idhkbcpv3irnsf9kbuac9sfjtp9j3bt5.apps.googleusercontent.com"/>
                    <meta name="google-signin-cookiepolicy" content="single_host_origin"/>
                    <meta name="google-signin-scope" content="profile email"/>
                    <title>archeun | NOTES</title>
                </Head>
                <Layout className={styles.level1Layout}>
                    <div className={styles.savingLoader}>{savingLoader}</div>
                    <Header className={styles.header}>
                        <div className={styles.logo}>archeun | NOTES</div>
                        <Menu className={styles.rightMenuItems} theme="dark" mode="horizontal">
                            <Menu.Item key="username">{welcomeText}</Menu.Item>
                            <Menu.Item key="sign-in-out-buttons">{signInOutButton}</Menu.Item>
                        </Menu>
                    </Header>
                    <Layout className={styles.level2Layout}>
                        <Sider className={styles.sider} breakpoint="lg" collapsedWidth="0" theme='light' width={280}>
                            <ArchNotesList loggedInUser={this.state.loggedInUser}
                                           notesAndDirectories={this.state.notesAndDirectories}
                                           onNoteListChange={this.initNotesAndDirList}
                                           onSelectNote={(note) => {
                                               this.setState({selectedNote: note})
                                           }}
                                           loading={this.state.loading.notesList}/>
                        </Sider>
                        <Layout className={styles.level3Layout}>
                            <Content className={styles.editorContent}><ArchNotesEditor content={editorContent}
                                                                                       onEditorBlur={this.saveEditorContent}/></Content>
                            <div className={styles.footer}>ArCheun ©2020 Created by Aruna Tebel</div>
                        </Layout>
                    </Layout>
                </Layout>
            </>
        );
    }
}

export default Home;
