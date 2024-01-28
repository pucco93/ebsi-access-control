import {
  Button,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import ResourceRole from "../../../models/ResourceRole";
import { useSelector } from "react-redux";
import AccessControlListType from "../../../store/accessControlListType";
import {
  getResources,
  getRoles,
} from "../../../store/accessControlListSelectors";
import { Add, Delete } from "@mui/icons-material";
import styles from "../UsersView.module.css";
import { useCallback } from "react";

export interface IResourceRoleProps {
  blocks: ResourceRole[];
  selectResourceRoles: boolean;
  addResourceRole: (resourceRole: ResourceRole[]) => void;
}

const ResourceRoleSelector = (props: IResourceRoleProps) => {
  const { selectResourceRoles, addResourceRole, blocks } = props;
  const resources = useSelector(
    (state: { accessControlList: AccessControlListType }) => getResources(state)
  );
  const roles = useSelector(
    (state: { accessControlList: AccessControlListType }) => getRoles(state)
  );

  const onResourceChange = useCallback(
    (newValue: string, index: number) => {
      if (newValue) {
        const newBlock = blocks[index];
        newBlock.resourceName = newValue;
        const newBlockList = [
          ...blocks.slice(0, index),
          newBlock,
          ...blocks.slice(index + 1, blocks.length),
        ];
        addResourceRole(newBlockList);
      }
    },
    [resources, blocks]
  );

  const onRoleChange = useCallback(
    (newValue: string, index: number) => {
      if (newValue) {
        const newRole = roles.find((role) => role.name === newValue);
        if (newRole?.name) {
          const newBlock = blocks[index];
          newBlock.role = newRole;
          const newBlockList = [
            ...blocks.slice(0, index),
            newBlock,
            ...blocks.slice(index + 1, blocks.length),
          ];
          addResourceRole(newBlockList);
        }
      }
    },
    [roles, blocks]
  );

  const triggerAddItem = useCallback(() => {
    const newResourceRole = {
      resourceName: "",
      role: {
        name: "",
        permissions: [],
        isCustom: false,
      },
    };
    addResourceRole([...blocks, newResourceRole]);
  }, [addResourceRole, blocks]);

  const triggerDeleteRow = useCallback(
    (index: number) => {
      const newBlocks = [...blocks];
      newBlocks.splice(index, 1);
      addResourceRole(newBlocks);
    },
    [blocks, addResourceRole]
  );

  return (
    selectResourceRoles && (
      <>
        <List>
          {blocks?.map((block: ResourceRole, index: number) => (
            <ListItem
              key={index}
              style={{
                paddingLeft: "0px",
                paddingRight: "0px",
                justifyContent: "space-between",
              }}
            >
              <FormControl fullWidth style={{ marginRight: "1%" }}>
                <InputLabel id="select-resource">Resource</InputLabel>
                <Select
                  labelId="resource-select-label"
                  id="resource"
                  value={block?.resourceName}
                  label="Resource"
                  onChange={(event: SelectChangeEvent) =>
                    onResourceChange(event?.target?.value, index)
                  }
                >
                  {resources?.map((resource: Resource) => (
                    <MenuItem key={resource?.name} value={resource?.name}>
                      {resource?.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth style={{ marginLeft: "1%" }}>
                <InputLabel id="select-role">Role</InputLabel>
                <Select
                  labelId="role-select-label"
                  id="role"
                  value={block?.role?.name}
                  label="Role"
                  onChange={(event: SelectChangeEvent) =>
                    onRoleChange(event?.target?.value, index)
                  }
                >
                  {roles?.map((role: Role) => (
                    <MenuItem value={role?.name} key={role.name}>
                      {role?.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl style={{ margin: "0px 2%" }}>
                <IconButton
                  onClick={() => triggerDeleteRow(index)}
                  color="error"
                  aria-label="Delete"
                >
                  <Delete />
                </IconButton>
              </FormControl>
            </ListItem>
          ))}
        </List>
        <Button
          className={styles.addItem}
          variant="contained"
          onClick={triggerAddItem}
          aria-label="add"
          startIcon={<Add />}
        >
          Add item
        </Button>
      </>
    )
  );
};

export default ResourceRoleSelector;
