import React from 'react'
import {CKEditor} from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';


class ArchNotesEditor extends React.Component {

    render() {
        return (

            <CKEditor
                editor={ClassicEditor}
                data={this.props.content ? this.props.content : ''}
                onReady={editor => {
                    // You can store the "editor" and use when it is needed.
                    // console.log('Editor is ready to use!', editor);
                }}
                onChange={(event, editor) => {
                    const data = editor.getData();
                }}
                onBlur={(event, editor) => {
                    this.props.onEditorBlur(editor.getData());
                }}
                onFocus={(event, editor) => {
                }}
            />
        );
    }
}

export default ArchNotesEditor;
