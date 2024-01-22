import { store } from "../store/store";
import { createAlert, deleteAlert, cancelLoading } from "../store/accessControlListStore";

const useAlert = (msg: string, color: string = 'green') => {
    store.dispatch(cancelLoading());
    store.dispatch(createAlert({msg, show: true, color}));
    setTimeout(() => {
        store.dispatch(deleteAlert());
    }, 6000);
};

export default useAlert;