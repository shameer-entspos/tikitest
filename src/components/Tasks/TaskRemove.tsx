'use client';

import {
  Avatar,
  Checkbox,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from '@nextui-org/react';
import 'react-datepicker/dist/react-datepicker.css';
import { useTaskCotnext } from '@/app/(main)/(user-panel)/user/tasks/context';
import { TASKTYPE } from '@/app/helpers/user/enums';
import { Button } from '../Buttons';
import { useMutation, useQueryClient } from 'react-query';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { deleteTask } from '@/app/(main)/(user-panel)/user/tasks/api';
import Loader from '../DottedLoader/loader';
import { CalendarCheck2, TriangleAlert, X } from 'lucide-react';
import CustomHr from '../Ui/CustomHr';
import CustomInfoModal from '../CustomDeleteModel';

const TaskRemove = ({ adminMode = false }: { adminMode?: boolean }) => {
  const queryClient = useQueryClient();
  const axiosAuth = useAxiosAuth();
  const { state, dispatch } = useTaskCotnext();
  const userDeleteTaskMutation = useMutation(deleteTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks');
      dispatch({
        type: TASKTYPE.SHOWREMOVE,
      });
    },
  });

  return (
    <>
      <CustomInfoModal
        title="Delete Task"
        subtitle="Are you sure you want to delete this task. This action cannot be undone."
        handleClose={() => {
          dispatch({ type: TASKTYPE.SHOWREMOVE });
        }}
        onDeleteButton={() => {
          userDeleteTaskMutation.mutate({
            axiosAuth,
            body: { id: state.removeid ?? '', removeBy: 'everyone' },
            adminMode,
          });
        }}
        doneValue={userDeleteTaskMutation.isLoading ? <Loader /> : <>Delete</>}
        variant="danger"
        cancelvariant="primaryOutLine"
        isOpen={true}
      />
    </>
  );
};

export { TaskRemove };
