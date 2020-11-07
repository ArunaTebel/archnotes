import React from 'react'
import {CKEditor} from '@ckeditor/ckeditor5-react';
import ClassicEditor from 'ckeditor5-build-archeun/build/ckeditor';


class ArchNotesEditor extends React.Component {

    render() {
        return (

            <CKEditor
                editor={ClassicEditor}
                data={this.props.content ? this.props.content : ''}
                config={{
                    language: 'en',
                    image: {
                        toolbar: [
                            'imageTextAlternative',
                            'imageStyle:full',
                            'imageStyle:side'
                        ]
                    },
                    table: {
                        contentToolbar: [
                            'tableColumn',
                            'tableRow',
                            'mergeTableCells'
                        ]
                    },
                    toolbar: [
                        'heading',
                        '|',
                        'bold',
                        'italic',
                        'link',
                        'bulletedList',
                        'numberedList',
                        '|',
                        'indent',
                        'outdent',
                        '|',
                        // 'imageUpload',
                        'blockQuote',
                        'insertTable',
                        'undo',
                        'redo',
                        'alignment',
                        'code',
                        'codeBlock',
                        'fontBackgroundColor',
                        'fontColor',
                        'fontSize',
                        'fontFamily',
                        'highlight',
                        'horizontalLine',
                        // 'imageInsert',
                        'pageBreak',
                        'removeFormat'
                    ]
                }}
                onReady={editor => {

                }}
                onChange={(event, editor) => {

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
