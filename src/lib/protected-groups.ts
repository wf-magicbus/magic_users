import { supabaseAdmin } from "@/lib/supabase/admin";

type ProtectedGroupRow = {
    id: string;
    group_name: string;
    description: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    member_count?: number | null;
    members?: string[] | null;
};

type UserProfileRow = {
    user_id: string;
    name: string | null;
    status: "active" | "locked" | "disabled" | null;
    role: string | null;
};

export type ProtectedGroupMember = {
    user_id: string;
    name: string;
    email: string;
    status: "active" | "locked" | "disabled";
    role: string | null;
};

export type ProtectedGroupResponse = {
    id: string;
    group_name: string;
    description: string | null;
    created_at: string | null;
    updated_at: string | null;
    member_count: number;
    members: ProtectedGroupMember[];
};

export function normalizeProtectedGroupMembers(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return Array.from(
        new Set(
            value
                .map((memberId) => (typeof memberId === "string" ? memberId.trim() : ""))
                .filter((memberId) => memberId.length > 0)
        )
    );
}

async function fetchMemberDirectory(memberIds: string[]) {
    if (memberIds.length === 0) {
        return new Map<string, ProtectedGroupMember>();
    }

    const { data: profiles, error } = await supabaseAdmin
        .from("user_profiles")
        .select(`
      user_id,
      name,
      status,
      role
    `)
        .in("user_id", memberIds);

    if (error) {
        throw error;
    }

    const profileRows = (profiles ?? []) as UserProfileRow[];

    const authUsers = await Promise.all(
        profileRows.map(async (profile) => {
            const { data: authData } = await supabaseAdmin.auth.admin.getUserById(profile.user_id);

            return {
                user_id: profile.user_id,
                name: profile.name ?? "",
                email: authData.user?.email ?? "",
                status: profile.status ?? "active",
                role: profile.role,
            } satisfies ProtectedGroupMember;
        })
    );

    return new Map(authUsers.map((user) => [user.user_id, user]));
}

export async function serializeProtectedGroup(row: ProtectedGroupRow): Promise<ProtectedGroupResponse> {
    const memberIds = normalizeProtectedGroupMembers(row.members);
    const directory = await fetchMemberDirectory(memberIds);
    const members = memberIds
        .map((memberId) => directory.get(memberId))
        .filter((member): member is ProtectedGroupMember => Boolean(member));

    return {
        id: row.id,
        group_name: row.group_name,
        description: row.description ?? null,
        created_at: row.created_at ?? null,
        updated_at: row.updated_at ?? null,
        member_count: row.member_count ?? members.length,
        members,
    };
}

export async function serializeProtectedGroups(rows: ProtectedGroupRow[]): Promise<ProtectedGroupResponse[]> {
    const memberIds = Array.from(
        new Set(rows.flatMap((row) => normalizeProtectedGroupMembers(row.members)))
    );
    const directory = await fetchMemberDirectory(memberIds);

    return rows.map((row) => {
        const rowMemberIds = normalizeProtectedGroupMembers(row.members);
        const members = rowMemberIds
            .map((memberId) => directory.get(memberId))
            .filter((member): member is ProtectedGroupMember => Boolean(member));

        return {
            id: row.id,
            group_name: row.group_name,
            description: row.description ?? null,
            created_at: row.created_at ?? null,
            updated_at: row.updated_at ?? null,
            member_count: row.member_count ?? members.length,
            members,
        } satisfies ProtectedGroupResponse;
    });
}