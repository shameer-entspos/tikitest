import { PostActions } from "@/app/helpers/user/actions";
import { POSTTYPE } from "@/app/helpers/user/enums";
import { PostState } from "@/app/helpers/user/states";
import { Dispatch, createContext, useContext } from "react";

export interface PostContextProps {
  state: PostState;
  dispatch: Dispatch<PostActions>;
}

export const postInitialState: PostState = {
  isDialogOpen: false,
  showDetail: false,
  selectedImages: [],
};

const initialContext: PostContextProps = {
  state: {
    isDialogOpen: false,
    showDetail: false,

    selectedImages: [],
  },
  dispatch: () => {},
};

export const PostContext = createContext<PostContextProps>(initialContext);

export const postReducer = (
  state: PostState,
  action: PostActions
): PostState => {
  switch (action.type) {
    case POSTTYPE.TOGGLE:
      return { isDialogOpen: !state.isDialogOpen };
    case POSTTYPE.SHOWDETAIL:
      return { ...state, showDetail: !state.showDetail, post: action.post };
    case POSTTYPE.SELCTIMAGE:
      return {
        ...state,
        selectedImages: [
          ...(state.selectedImages ?? []),
          action.selectedImages!,
        ],
      };
    case POSTTYPE.DESELCTIMAGE:
      const newSelectedImages = state.selectedImages!.filter(
        (_, index) => index !== action.deletetedImageIndex
      );

      return {
        ...state,
        selectedImages: newSelectedImages,
      };
    case POSTTYPE.WRITECOMMENT:
      return { ...state, commentController: action.commentController };
    case POSTTYPE.FILTER:
      return { ...state, selectedFilter: action.selectedFilter };
    default:
      throw new Error("Unknown action type");
  }
};

export function usePostCotnext() {
  const context = useContext(PostContext);
  if (!context) {
    throw "error";
  }
  return context;
}
