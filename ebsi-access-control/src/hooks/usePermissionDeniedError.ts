import { store } from "../store/store";
import {
  createPermissionDeniedErrorsAlert,
  deletePermissionDeniedErrorsAlert
} from "../store/accessControlListStore";

const usePermissionDeniedErrorsAlert = (msg: string, color: string = 'red') => {
    store.dispatch(createPermissionDeniedErrorsAlert({msg, show: true, color}));
    setTimeout(() => {
        store.dispatch(deletePermissionDeniedErrorsAlert());
    }, 3000);
};

export default usePermissionDeniedErrorsAlert;