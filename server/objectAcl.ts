import { File } from "@google-cloud/storage";

const ACL_POLICY_METADATA_KEY = "custom:aclPolicy";

/**
 * Types of logical access groups
 */
export enum ObjectAccessGroupType {
  USER_LIST = "user_list",
  EMAIL_DOMAIN = "email_domain",
  GROUP_MEMBER = "group_member",
  SUBSCRIBER = "subscriber",
}

/**
 * Logical group of users that can access the object
 */
export interface ObjectAccessGroup {
  type: ObjectAccessGroupType;
  id: string;
}

export enum ObjectPermission {
  READ = "read",
  WRITE = "write",
}

export interface ObjectAclRule {
  group: ObjectAccessGroup;
  permission: ObjectPermission;
}

/**
 * ACL Policy stored in object metadata
 */
export interface ObjectAclPolicy {
  owner: string;
  visibility: "public" | "private";
  aclRules?: Array<ObjectAclRule>;
}

/**
 * Permission matching logic
 */
function isPermissionAllowed(
  requested: ObjectPermission,
  granted: ObjectPermission
): boolean {
  if (requested === ObjectPermission.READ) {
    return [ObjectPermission.READ, ObjectPermission.WRITE].includes(granted);
  }
  return granted === ObjectPermission.WRITE;
}

/**
 * Abstract base for access groups
 */
abstract class BaseObjectAccessGroup implements ObjectAccessGroup {
  constructor(
    public readonly type: ObjectAccessGroupType,
    public readonly id: string
  ) {}

  public abstract hasMember(userId: string): Promise<boolean>;
}

/**
 * Example group implementations
 */
class UserListAccessGroup extends BaseObjectAccessGroup {
  async hasMember(userId: string): Promise<boolean> {
    // TODO: Replace with DB lookup
    return userId === this.id;
  }
}

class EmailDomainAccessGroup extends BaseObjectAccessGroup {
  async hasMember(userId: string): Promise<boolean> {
    // TODO: Replace with DB lookup
    const fakeEmail = `${userId}@example.com`;
    return fakeEmail.endsWith(`@${this.id}`);
  }
}

class GroupMemberAccessGroup extends BaseObjectAccessGroup {
  async hasMember(userId: string): Promise<boolean> {
    // TODO: Replace with DB lookup
    return userId.startsWith(this.id);
  }
}

class SubscriberAccessGroup extends BaseObjectAccessGroup {
  async hasMember(userId: string): Promise<boolean> {
    // TODO: Replace with DB lookup
    return userId.includes(this.id);
  }
}

/**
 * Factory for group instantiation
 */
function createObjectAccessGroup(group: ObjectAccessGroup): BaseObjectAccessGroup {
  switch (group.type) {
    case ObjectAccessGroupType.USER_LIST:
      return new UserListAccessGroup(group.id);
    case ObjectAccessGroupType.EMAIL_DOMAIN:
      return new EmailDomainAccessGroup(group.id);
    case ObjectAccessGroupType.GROUP_MEMBER:
      return new GroupMemberAccessGroup(group.id);
    case ObjectAccessGroupType.SUBSCRIBER:
      return new SubscriberAccessGroup(group.id);
    default:
      throw new Error(`Unknown access group type: ${group.type}`);
  }
}

/**
 * Persist ACL policy in GCS metadata
 */
export async function setObjectAclPolicy(
  objectFile: File,
  aclPolicy: ObjectAclPolicy
): Promise<void> {
  const [exists] = await objectFile.exists();
  if (!exists) {
    throw new Error(`Object not found: ${objectFile.name}`);
  }

  await objectFile.setMetadata({
    metadata: {
      [ACL_POLICY_METADATA_KEY]: JSON.stringify(aclPolicy),
    },
  });
}

/**
 * Retrieve ACL policy from metadata
 */
export async function getObjectAclPolicy(
  objectFile: File
): Promise<ObjectAclPolicy | null> {
  const [metadata] = await objectFile.getMetadata();
  const aclPolicy = metadata?.metadata?.[ACL_POLICY_METADATA_KEY];
  if (!aclPolicy) return null;
  return JSON.parse(aclPolicy as string);
}

/**
 * Evaluate if user can access object
 */
export async function canAccessObject({
  userId,
  objectFile,
  requestedPermission,
}: {
  userId?: string;
  objectFile: File;
  requestedPermission: ObjectPermission;
}): Promise<boolean> {
  const aclPolicy = await getObjectAclPolicy(objectFile);
  if (!aclPolicy) return false;

  // Public read access
  if (
    aclPolicy.visibility === "public" &&
    requestedPermission === ObjectPermission.READ
  ) {
    return true;
  }

  // Must have a userId for private
  if (!userId) return false;

  // Owner override
  if (aclPolicy.owner === userId) return true;

  // Apply rules
  for (const rule of aclPolicy.aclRules || []) {
    const accessGroup = createObjectAccessGroup(rule.group);
    if (
      (await accessGroup.hasMember(userId)) &&
      isPermissionAllowed(requestedPermission, rule.permission)
    ) {
      return true;
    }
  }

  return false;
}
