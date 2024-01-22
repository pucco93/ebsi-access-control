import { store } from "../store/store";
import { createCustomErrorsAlert, deleteCustomErrorsAlert } from "../store/accessControlListStore";

const useCustomErrorsAlert = (msg: string, color: string = 'red') => {
    store.dispatch(createCustomErrorsAlert({msg, show: true, color}));
    setTimeout(() => {
        store.dispatch(deleteCustomErrorsAlert());
    }, 6000);
};

export default useCustomErrorsAlert;