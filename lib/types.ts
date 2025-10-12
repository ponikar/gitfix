export type Branch = {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
};

export type TreeEntry = {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
  url: string;
};

export type Tree = {
  sha: string;
  url: string;
  tree: TreeEntry[];
  truncated: boolean;
};
