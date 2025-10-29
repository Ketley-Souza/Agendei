import { Notification } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';

export const notification = (type, params) => {
    Notification[type](params);
};