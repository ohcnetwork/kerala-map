import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { MODAL_ACTION } from "../constants";
import { AuthContext } from "../context/AuthContext";
import { ModalContext } from "../context/ModalContext";
import { ThemeContext } from "../context/ThemeContext";
import {
  createDescription,
  createFeature,
  deleteDescription,
  deleteFeature,
  login as loginRequest,
  updateDescription,
  updateFeature,
} from "../requests";

function Modal() {
  const { dark } = useContext(ThemeContext);
  const { auth, login } = useContext(AuthContext);
  const { modal, setModal } = useContext(ModalContext);

  const loginForm = () => {
    const { register, handleSubmit, errors, setError } = useForm();
    return (
      <form className="flex flex-col items-center space-y-2">
        <p className={`${dark ? "text-white" : "text-black"} font-semibold`}>
          {errors.info
            ? "Wrong credentials"
            : "This feature is for authorized personnel only"}
        </p>
        <input
          type="text"
          name="username"
          placeholder="Username"
          className="p-1"
          required
          ref={register}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="p-1"
          required
          ref={register}
        />
        <div className="space-x-2">
          <button
            onClick={handleSubmit((data) =>
              loginRequest(data)
                .then((r) => {
                  login(r.data);
                  setModal({ ...modal, show: false });
                })
                .catch((e) => {
                  setError("info", e);
                })
            )}
            className="w-16 bg-white"
          >
            Login
          </button>
          <button
            onClick={() => setModal({ ...modal, show: false })}
            className="w-16 bg-white"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  };

  const descUpdateForm = () => {
    const { register, handleSubmit, errors, setError } = useForm({
      defaultValues: {
        text: modal.payload.data,
      },
    });
    return (
      <form className="flex flex-col items-center space-y-2">
        <p className={`${dark ? "text-white" : "text-black"} font-semibold`}>
          {errors.text ? errors.text?.message || "Error!" : "Enter details"}
        </p>
        <div>
          <p
            className={`${
              dark ? "text-white" : "text-black"
            } text-xs w-64 text-center`}
          >
            Maximum 120 characters.
          </p>
          <p
            className={`${
              dark ? "text-white" : "text-black"
            } text-xs w-64 text-center`}
          >
            To remove marking, just leave the form empty and save.
          </p>
        </div>
        <textarea
          name="text"
          className="p-1"
          ref={register({
            maxLength: {
              value: 120,
              message: "Maximum 120 characters",
            },
          })}
          defaultValue={modal.payload.data}
        />
        <div className="space-x-2">
          <button
            onClick={handleSubmit((data) => {
              let d = modal.payload;
              if (d.data == data.text) {
                setModal({ ...modal, show: false });
                return;
              }
              let job: Promise<any>;
              if (d.id == 0) {
                if (data.text) {
                  job = createDescription(
                    { district: d.district, lsgd: d.lsgd, data: data.text },
                    auth.token
                  );
                }
              } else {
                if (data.text) {
                  job = updateDescription(
                    d.id,
                    { data: data.text },
                    auth.token
                  );
                } else {
                  job = deleteDescription(d.id, auth.token);
                }
              }
              job
                .catch((e) => console.error(e))
                .finally(() =>
                  setModal({
                    ...modal,
                    show: false,
                    action: MODAL_ACTION.DESC_UPDATE_DONE,
                  })
                );
            })}
            className="w-16 bg-white"
          >
            Save
          </button>
          <button
            onClick={() => setModal({ ...modal, show: false })}
            className="w-16 bg-white"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  };

  const featureUpdateForm = () => {
    const { register, handleSubmit, errors, setError } = useForm({
      defaultValues: {
        text: modal.payload.description,
      },
    });
    return (
      <form className="flex flex-col items-center space-y-2">
        <p className={`${dark ? "text-white" : "text-black"} font-semibold`}>
          {errors.text ? errors.text?.message || "Error!" : "Enter details"}
        </p>
        <div>
          <p
            className={`${
              dark ? "text-white" : "text-black"
            } text-xs w-64 text-center`}
          >
            Maximum 120 characters.
          </p>
        </div>
        <textarea
          name="text"
          className="p-1"
          ref={register({
            maxLength: {
              value: 120,
              message: "Maximum 120 characters",
            },
          })}
          defaultValue={modal.payload.description}
        />
        <div className="space-x-2">
          <button
            onClick={handleSubmit((data) => {
              let d = modal.payload;
              let job =
                d.id == 0
                  ? createFeature(
                      { data: d.data, description: data.text },
                      auth.token
                    )
                  : updateFeature(
                      d.id,
                      { data: d.data, description: data.text },
                      auth.token
                    );
              job
                .catch((e) => console.error(e))
                .finally(() =>
                  setModal({
                    ...modal,
                    show: false,
                    action: MODAL_ACTION.FEATURE_UPDATE_DONE,
                  })
                );
            })}
            className="w-16 bg-white"
          >
            Save
          </button>
          <button
            onClick={() =>
              setModal({
                ...modal,
                show: false,
                action: MODAL_ACTION.FEATURE_UPDATE_DONE,
              })
            }
            className="w-16 bg-white"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  };

  const featureDeleteForm = () => {
    return (
      <div className="flex flex-col items-center space-y-2">
        <p className={`${dark ? "text-white" : "text-black"} font-semibold`}>
          Are you sure?
        </p>
        <div className="space-x-2">
          <button
            onClick={() => {
              let d = modal.payload;
              deleteFeature(d.id, auth.token)
                .catch((e) => console.error(e))
                .finally(() =>
                  setModal({
                    ...modal,
                    show: false,
                    action: MODAL_ACTION.FEATURE_UPDATE_DONE,
                  })
                );
            }}
            className="w-16 bg-white"
          >
            Delete
          </button>
          <button
            onClick={() =>
              setModal({
                ...modal,
                show: false,
                action: MODAL_ACTION.FEATURE_UPDATE_DONE,
              })
            }
            className="w-16 bg-white"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`absolute flex h-screen w-screen items-center justify-center overflow-hidden bg-opacity-75 z-40 ${
        dark ? "bg-dark-500" : "bg-light-500"
      }`}
    >
      {modal.action === MODAL_ACTION.LOGIN && loginForm()}
      {modal.action === MODAL_ACTION.DESC_UPDATE && descUpdateForm()}
      {modal.action === MODAL_ACTION.FEATURE_UPDATE && featureUpdateForm()}
      {modal.action === MODAL_ACTION.FEATURE_DELETE && featureDeleteForm()}
    </div>
  );
}

export default Modal;
