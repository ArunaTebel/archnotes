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
        let loggedInUser = this.state.loggedInUser;
        return (
            <>
                <Head>
                    <script src="https://apis.google.com/js/platform.js" async defer/>
                    <meta name="google-signin-client_id" content="914280926964-idhkbcpv3irnsf9kbuac9sfjtp9j3bt5.apps.googleusercontent.com"/>
                    <meta name="google-signin-cookiepolicy" content="single_host_origin"/>
                    <meta name="google-signin-scope" content="profile email"/>
                    <title>archeun | NOTES</title>
                </Head>
                <Layout>
                    <Header className="header">
                        <div className="logo" style={{
                            height: '52px',
                            color: 'white',
                            float: 'left'
                        }}>archeun | NOTES
                        </div>
                        <Menu style={{float: 'right'}} theme="dark" mode="horizontal">
                            <Menu.Item key="1">
                                <div>{loggedInUser ? `Welcome, ${loggedInUser.displayName}` : ''}</div>
                            </Menu.Item>
                            <Menu.Item key="2">
                                {loggedInUser ? '' : <div id="g-signin2" data-theme="dark"/>}
                                <Button onClick={ArchAuth.signOut}>
                                    {loggedInUser ? 'Logout' : ''}
                                </Button>
                            </Menu.Item>
                        </Menu>
                    </Header>
                    <Layout>
                        <Sider style={{height: '100%',}} breakpoint="lg" collapsedWidth="0" theme='light'>
                            <ArchNotesList loggedInUser={this.state.loggedInUser}
                                           notesAndDirectories={this.state.notesAndDirectories}
                                           onNoteListChange={() => {
                                               return this.initNotesAndDirList().then();
                                           }}
                                           onSelectNote={(note) => {
                                               this.setState({selectedNote: note})
                                           }}
                                           loading={this.state.loading.notesList}/>
                        </Sider>
                        <Layout>
                            <Content>
                                <ArchNotesEditor content={this.state.selectedNote ? this.state.selectedNote.content : ''}
                                                 onEditorBlur={this.saveEditorContent}/>
                            </Content>
                            <Footer style={{textAlign: 'center'}}>Ant Design ©2018 Created by Ant UED</Footer>
                        </Layout>
                    </Layout>
                </Layout>
            </>
        );
    }
}

export default Home;
