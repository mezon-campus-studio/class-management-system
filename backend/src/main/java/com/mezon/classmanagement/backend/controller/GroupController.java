// controller/GroupController.java
package com.mezon.classmanagement.backend.controller;

import com.mezon.classmanagement.backend.dto.group.CreateAndUpdateGroupRquestDto;
import com.mezon.classmanagement.backend.dto.group.GroupIdResponseDto;
import com.mezon.classmanagement.backend.dto.group.Groupdto;
import com.mezon.classmanagement.backend.service.GroupService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/classes/{classId}/groups")
public class GroupController {

    GroupService groupService;

    @PostMapping
    public ResponseEntity<Groupdto> createGroup(
            @PathVariable Long classId,
            @RequestBody CreateAndUpdateGroupRquestDto request
    ) {
        Groupdto response = groupService.createGroup(classId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{groupId}")
    public ResponseEntity<Groupdto> updateGroup(
            @PathVariable Long classId,
            @PathVariable Long groupId,
            @RequestBody CreateAndUpdateGroupRquestDto request
    ) {
        Groupdto response = groupService.updateGroup(classId, groupId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<GroupIdResponseDto> deleteGroup(
            @PathVariable Long classId,
            @PathVariable Long groupId
    ) {
        GroupIdResponseDto response = groupService.deleteGroup(classId, groupId);
        return ResponseEntity.ok(response);
    }
}