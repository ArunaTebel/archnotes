import {message,} from 'antd';

const ArchMessage = {
    success: (msg) => {
        message.success(msg);
    },
    info: (msg) => {
        message.info(msg);
    },
    error: (msg) => {
        message.error(msg);
    },
    warning: (msg) => {
        message.warning(msg);
    },
}

export default ArchMessage;