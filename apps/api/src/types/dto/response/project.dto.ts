// 直接定义所需的类型，避免循环引用

export interface ProjectResponse {
  id: string;
  name: string;
  description: string | null;
  type: string;
  thumbnailUrl: string | null;
  ownerName: string | null;
  shotCount: number;
  characterCount: number;
  createdAt: string;
  updatedAt: string;
}

export class ProjectResponseDTO {
  static fromProjectListItem(project: any): ProjectResponse {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      type: project.type,
      thumbnailUrl: project.thumbnail_url,
      ownerName: project.User?.name ?? null,
      shotCount: project._count?.Shot ?? 0,
      characterCount: project._count?.Character ?? 0,
      createdAt: project.created_at?.toISOString?.() ?? new Date().toISOString(),
      updatedAt: project.updated_at?.toISOString?.() ?? new Date().toISOString(),
    };
  }

  static fromProjectDetail(project: any): ProjectResponse & { status: string; settings: Record<string, unknown> } {
    return {
      ...this.fromProjectListItem(project),
      status: project.status || 'active',
      settings: project.settings || {},
    };
  }

  static fromProjectWithMembers(project: any): ProjectResponse & { members: Array<{ userId: string; userName: string | null; role: string }> } {
    return {
      ...this.fromProjectListItem(project),
      members: project.ProjectMember?.map((m: any) => ({
        userId: m.User?.id,
        userName: m.User?.name,
        role: m.role,
      })) || [],
    };
  }

  static toListResponse(
    projects: any[],
    total: number,
    page: number,
    limit: number
  ) {
    return {
      success: true,
      data: projects.map((p) => this.fromProjectListItem(p)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
